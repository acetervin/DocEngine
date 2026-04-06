import { useState, useCallback, useEffect } from 'react';
import { CompanyProfile, BankDetails, MpesaDetails, PaymentMethod } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const defaultProfile: CompanyProfile = {
  id: '',
  companyName: '',
  logo: undefined,
  address: '',
  phone: '',
  email: '',
  taxId: '',
  bankDetails: { bankName: '', accountName: '', accountNumber: '', swift: '' },
  mpesaDetails: { businessName: '', businessNumber: '', accountNumber: '' },
  paymentMethods: ['bank_transfer'],
  counters: { invoice: 0, proposal: 0, receipt: 0 },
};

export const useCompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);
  const [dbId, setDbId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from DB
  useEffect(() => {
    if (!user) { setProfile(defaultProfile); setDbId(null); setLoaded(false); return; }

    const load = async () => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setDbId(data.id);
        setProfile({
          id: data.id,
          companyName: data.company_name,
          logo: data.logo_url || undefined,
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          taxId: data.tax_id || '',
          bankDetails: data.bank_details as any,
          mpesaDetails: data.mpesa_details as any,
          paymentMethods: (data.payment_methods || ['bank_transfer']) as PaymentMethod[],
          counters: data.counters as any,
        });
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  // Persist to DB with debounce
  useEffect(() => {
    if (!user || !loaded) return;

    const timeout = setTimeout(async () => {
      const row = {
        user_id: user.id,
        company_name: profile.companyName,
        logo_url: profile.logo || null,
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
        tax_id: profile.taxId,
        bank_details: profile.bankDetails as any,
        mpesa_details: profile.mpesaDetails as any,
        payment_methods: profile.paymentMethods,
        counters: profile.counters as any,
      };

      if (dbId) {
        await supabase.from('company_profiles').update(row).eq('id', dbId);
      } else if (profile.companyName.trim()) {
        const { data } = await supabase.from('company_profiles').insert(row).select('id').single();
        if (data) {
          setDbId(data.id);
          setProfile(prev => ({ ...prev, id: data.id }));
        }
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [profile, user, dbId, loaded]);

  const updateCompanyName = useCallback((name: string) => {
    setProfile(prev => ({ ...prev, companyName: name }));
  }, []);

  const updateField = useCallback(<K extends keyof CompanyProfile>(field: K, value: CompanyProfile[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateBankDetails = useCallback((field: keyof BankDetails, value: string) => {
    setProfile(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value },
    }));
  }, []);

  const updateMpesaDetails = useCallback((field: keyof MpesaDetails, value: string) => {
    setProfile(prev => ({
      ...prev,
      mpesaDetails: { ...prev.mpesaDetails, [field]: value },
    }));
  }, []);

  const togglePaymentMethod = useCallback((method: PaymentMethod) => {
    setProfile(prev => {
      const methods = prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method];
      if (methods.length === 0) return prev;
      return { ...prev, paymentMethods: methods };
    });
  }, []);

  const peekNextDocNumber = useCallback((type: 'invoice' | 'proposal' | 'receipt'): string => {
    const prefixMap = { invoice: 'INV', proposal: 'PROP', receipt: 'REC' };
    const year = new Date().getFullYear();
    const nextNum = profile.counters[type] + 1;
    return `${prefixMap[type]}-${year}-${String(nextNum).padStart(4, '0')}`;
  }, [profile.counters]);

  const incrementCounter = useCallback((type: 'invoice' | 'proposal' | 'receipt') => {
    setProfile(prev => ({
      ...prev,
      counters: { ...prev.counters, [type]: prev.counters[type] + 1 },
    }));
  }, []);

  return {
    profile,
    updateCompanyName,
    updateField,
    updateBankDetails,
    updateMpesaDetails,
    togglePaymentMethod,
    getNextDocNumber: peekNextDocNumber,
    peekNextDocNumber,
    incrementCounter,
  };
};
