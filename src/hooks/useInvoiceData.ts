import { useState, useCallback } from 'react';
import { InvoiceData, LineItem, Currency, InvoiceStatus, PaymentMethod, Discount } from '@/types/document';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultData: InvoiceData = {
  companyName: '',
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  paymentTerms: '',
  client: {
    name: '',
    email: '',
    address: '',
  },
  lineItems: [
    { id: generateId(), description: '', descriptionAr: '', quantity: 1, unitPrice: 0, taxable: true },
  ],
  taxRate: 5,
  discount: { type: 'percentage', value: 0 },
  currency: 'KWD',
  status: 'pending',
  bankDetails: {
    bankName: '',
    accountName: '',
    accountNumber: '',
    swift: '',
  },
  paymentMethods: ['bank_transfer'],
  notes: '',
};

export const useInvoiceData = () => {
  const [data, setData] = useState<InvoiceData>(defaultData);

  const updateField = useCallback(<K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateClient = useCallback((field: keyof InvoiceData['client'], value: string) => {
    setData(prev => ({ ...prev, client: { ...prev.client, [field]: value } }));
  }, []);

  const updateLineItem = useCallback((id: string, field: keyof LineItem, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const addLineItem = useCallback(() => {
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: generateId(), description: '', descriptionAr: '', quantity: 1, unitPrice: 0, taxable: true }],
    }));
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
  }, []);

  const updateBankDetails = useCallback((field: keyof InvoiceData['bankDetails'], value: string) => {
    setData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));
  }, []);

  const updateDiscount = useCallback((discount: Discount) => {
    setData(prev => ({ ...prev, discount }));
  }, []);

  const resetData = useCallback(() => {
    setData({
      ...defaultData,
      lineItems: [{ id: generateId(), description: '', descriptionAr: '', quantity: 1, unitPrice: 0, taxable: true }],
    });
  }, []);

  const subtotal = data.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  
  const discount = data.discount || { type: 'percentage' as const, value: 0 };
  const discountAmount = discount.type === 'percentage'
    ? subtotal * (discount.value / 100)
    : discount.value;

  const afterDiscount = subtotal - discountAmount;

  // Tax only on taxable items (proportionally reduced by discount)
  const taxableSubtotal = data.lineItems
    .filter(item => item.taxable !== false)
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  
  const discountRatio = subtotal > 0 ? (subtotal - discountAmount) / subtotal : 1;
  const adjustedTaxable = taxableSubtotal * discountRatio;
  
  const tax = adjustedTaxable * (data.taxRate / 100);
  const total = afterDiscount + tax;

  return {
    data, subtotal, discountAmount, tax, total, setData,
    updateField, updateClient, updateLineItem, addLineItem, removeLineItem, updateBankDetails, updateDiscount, resetData,
  };
};
