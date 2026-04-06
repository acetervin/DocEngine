import { useLanguage } from '@/contexts/LanguageContext';
import { InvoiceData, LineItem, Currency, InvoiceStatus, PaymentMethod, CompanyProfile, BankDetails, MpesaDetails, Discount } from '@/types/document';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  data: InvoiceData;
  updateField: <K extends keyof InvoiceData>(f: K, v: InvoiceData[K]) => void;
  updateClient: (f: keyof InvoiceData['client'], v: string) => void;
  updateLineItem: (id: string, f: keyof LineItem, v: string | number | boolean) => void;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  updateDiscount: (d: Discount) => void;
  companyProfile: CompanyProfile;
  onUpdateCompanyName: (name: string) => void;
  onUpdateCompanyField: <K extends keyof CompanyProfile>(f: K, v: CompanyProfile[K]) => void;
  onUpdateBankDetails: (f: keyof BankDetails, v: string) => void;
  onUpdateMpesaDetails: (f: keyof MpesaDetails, v: string) => void;
  onTogglePaymentMethod: (method: PaymentMethod) => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground pb-1 border-b border-border/40 mb-3">{children}</h4>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{children}</label>
);

const InvoiceForm = ({
  data, updateField, updateClient, updateLineItem, addLineItem, removeLineItem, updateDiscount,
  companyProfile, onUpdateCompanyName, onUpdateCompanyField, onUpdateBankDetails, onUpdateMpesaDetails, onTogglePaymentMethod,
}: Props) => {
  const { tr } = useLanguage();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onUpdateCompanyField('logo', result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 p-5 overflow-y-auto h-full scrollbar-thin">
      {/* Company Profile (shared) */}
      <section className="space-y-3">
        <SectionLabel>{tr.companyProfile}</SectionLabel>
        {/* Logo */}
        <div className="flex items-start gap-3">
          {companyProfile.logo ? (
            <div className="relative">
              <img src={companyProfile.logo} alt="Logo" className="max-h-24 max-w-[200px] rounded-lg object-contain border border-border" />
              <button
                onClick={() => onUpdateCompanyField('logo', undefined as any)}
                className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logoInputRef.current?.click()}
              className="h-16 w-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors gap-1"
            >
              <Upload className="h-4 w-4" />
              <span className="text-[9px]">Upload Logo</span>
            </button>
          )}
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <div className="flex-1">
            <FieldLabel>{tr.companyName}</FieldLabel>
            <Input className="h-9 text-sm rounded-lg" value={companyProfile.companyName} onChange={e => onUpdateCompanyName(e.target.value)} />
            <p className="text-[9px] text-muted-foreground mt-1">Recommended logo: 200×80px, PNG/SVG</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>{tr.companyAddress}</FieldLabel>
            <Input className="h-9 text-sm rounded-lg" value={companyProfile.address} onChange={e => onUpdateCompanyField('address', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{tr.companyPhone}</FieldLabel>
            <Input className="h-9 text-sm rounded-lg" value={companyProfile.phone} onChange={e => onUpdateCompanyField('phone', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{tr.companyEmail}</FieldLabel>
            <Input className="h-9 text-sm rounded-lg" value={companyProfile.email} onChange={e => onUpdateCompanyField('email', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{tr.taxId}</FieldLabel>
            <Input className="h-9 text-sm rounded-lg" value={companyProfile.taxId} onChange={e => onUpdateCompanyField('taxId', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Invoice Info */}
      <section className="space-y-3">
        <SectionLabel>{tr.documentBuilder}</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>{tr.date}</FieldLabel>
            <Input type="date" className="h-9 text-sm rounded-lg" value={data.date} onChange={e => updateField('date', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{tr.dueDate}</FieldLabel>
            <Input type="date" className="h-9 text-sm rounded-lg" value={data.dueDate || ''} onChange={e => updateField('dueDate', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{tr.paymentTerms}</FieldLabel>
            <Select value={data.paymentTerms || ''} onValueChange={v => updateField('paymentTerms', v)}>
              <SelectTrigger className="h-9 text-sm rounded-lg"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="net15">{tr.net15}</SelectItem>
                <SelectItem value="net30">{tr.net30}</SelectItem>
                <SelectItem value="net60">{tr.net60}</SelectItem>
                <SelectItem value="due_on_receipt">{tr.dueOnReceipt}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>{tr.currency}</FieldLabel>
            <Select value={data.currency} onValueChange={v => updateField('currency', v as Currency)}>
              <SelectTrigger className="h-9 text-sm rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="KWD">KWD (د.ك)</SelectItem>
                <SelectItem value="KES">KES</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <FieldLabel>{tr.status}</FieldLabel>
          <Select value={data.status} onValueChange={v => updateField('status', v as InvoiceStatus)}>
            <SelectTrigger className="h-9 text-sm rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">{tr.paid}</SelectItem>
              <SelectItem value="pending">{tr.pending}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {data.invoiceNumber && (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{tr.invoiceNumber}:</span>
            <span className="text-sm font-semibold tabular-nums">{data.invoiceNumber}</span>
          </div>
        )}
      </section>

      {/* Client */}
      <section className="space-y-3">
        <SectionLabel>{tr.clientInfo}</SectionLabel>
        <Input className="h-9 text-sm rounded-lg" placeholder={tr.clientName} value={data.client.name} onChange={e => updateClient('name', e.target.value)} />
        <Input className="h-9 text-sm rounded-lg" placeholder={tr.email} value={data.client.email} onChange={e => updateClient('email', e.target.value)} />
        <Input className="h-9 text-sm rounded-lg" placeholder={tr.address} value={data.client.address} onChange={e => updateClient('address', e.target.value)} />
      </section>

      {/* Line Items */}
      <section className="space-y-3">
        <SectionLabel>{tr.lineItems}</SectionLabel>
        {data.lineItems.map((item) => (
          <div key={item.id} className="space-y-1.5 p-3 rounded-lg border border-border/40 animate-fade-in">
            <div className="flex gap-2 items-end">
              <div className="flex-1 min-w-0">
                <FieldLabel>{tr.description}</FieldLabel>
                <Input className="h-9 text-sm rounded-lg" value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} />
              </div>
              <div className="w-14 shrink-0">
                <FieldLabel>{tr.quantity}</FieldLabel>
                <Input type="number" className="h-9 text-sm tabular-nums rounded-lg" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', Number(e.target.value))} />
              </div>
              <div className="w-20 shrink-0">
                <FieldLabel>{tr.unitPrice}</FieldLabel>
                <Input type="number" className="h-9 text-sm tabular-nums rounded-lg" value={item.unitPrice} onChange={e => updateLineItem(item.id, 'unitPrice', Number(e.target.value))} />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive rounded-lg" onClick={() => removeLineItem(item.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={item.taxable !== false}
                onCheckedChange={(checked) => updateLineItem(item.id, 'taxable', !!checked)}
              />
              <span className="text-[11px] text-muted-foreground">{item.taxable !== false ? tr.tax : tr.taxExempt}</span>
            </label>
          </div>
        ))}
        <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-lg w-full" onClick={addLineItem}>
          <Plus className="h-3.5 w-3.5" />{tr.addItem}
        </Button>
      </section>

      {/* Discount */}
      <section className="space-y-3">
        <SectionLabel>{tr.discount}</SectionLabel>
        <div className="flex gap-3">
          <div className="w-28">
            <FieldLabel>Type</FieldLabel>
            <Select value={data.discount.type} onValueChange={v => updateDiscount({ ...data.discount, type: v as 'percentage' | 'flat' })}>
              <SelectTrigger className="h-9 text-sm rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">%</SelectItem>
                <SelectItem value="flat">{tr.flat}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <FieldLabel>{tr.discount} {data.discount.type === 'percentage' ? '(%)' : `(${data.currency})`}</FieldLabel>
            <Input type="number" className="h-9 text-sm tabular-nums rounded-lg" value={data.discount.value} onChange={e => updateDiscount({ ...data.discount, value: Number(e.target.value) })} />
          </div>
        </div>
      </section>

      {/* Tax Rate */}
      <section className="space-y-3">
        <div className="w-32">
          <FieldLabel>{tr.taxRate} (%)</FieldLabel>
          <Input type="number" className="h-9 text-sm tabular-nums rounded-lg" value={data.taxRate} onChange={e => updateField('taxRate', Number(e.target.value))} />
        </div>
      </section>

      {/* Payment Methods */}
      <section className="space-y-3">
        <SectionLabel>{tr.paymentMethods}</SectionLabel>
        <div className="space-y-2">
          {(['bank_transfer', 'mpesa', 'stripe', 'cash'] as PaymentMethod[]).map((method) => (
            <label key={method} className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox
                checked={companyProfile.paymentMethods.includes(method)}
                onCheckedChange={() => onTogglePaymentMethod(method)}
              />
              <span className="text-sm">{
                method === 'bank_transfer' ? 'Bank Transfer' :
                method === 'mpesa' ? 'M-Pesa' :
                method === 'stripe' ? 'Stripe' : 'Cash'
              }</span>
            </label>
          ))}
        </div>
      </section>

      {/* Bank Details (shared) */}
      {companyProfile.paymentMethods.includes('bank_transfer') && (
        <section className="space-y-3">
          <SectionLabel>{tr.bankDetails}</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Input className="h-9 text-sm rounded-lg" placeholder={tr.bankName} value={companyProfile.bankDetails.bankName} onChange={e => onUpdateBankDetails('bankName', e.target.value)} />
            <Input className="h-9 text-sm rounded-lg" placeholder={tr.accountName} value={companyProfile.bankDetails.accountName} onChange={e => onUpdateBankDetails('accountName', e.target.value)} />
            <Input className="h-9 text-sm rounded-lg" placeholder={tr.accountNumber} value={companyProfile.bankDetails.accountNumber} onChange={e => onUpdateBankDetails('accountNumber', e.target.value)} />
            <Input className="h-9 text-sm rounded-lg" placeholder={tr.swift} value={companyProfile.bankDetails.swift} onChange={e => onUpdateBankDetails('swift', e.target.value)} />
          </div>
        </section>
      )}

      {/* M-Pesa Details (shared) */}
      {companyProfile.paymentMethods.includes('mpesa') && (
        <section className="space-y-3">
          <SectionLabel>{tr.mpesaDetails}</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Input className="h-9 text-sm rounded-lg" placeholder={tr.businessName} value={companyProfile.mpesaDetails.businessName} onChange={e => onUpdateMpesaDetails('businessName', e.target.value)} />
            <Input className="h-9 text-sm rounded-lg" placeholder={tr.businessNumber} value={companyProfile.mpesaDetails.businessNumber} onChange={e => onUpdateMpesaDetails('businessNumber', e.target.value)} />
            <Input className="h-9 text-sm rounded-lg" placeholder={tr.accountNumber} value={companyProfile.mpesaDetails.accountNumber} onChange={e => onUpdateMpesaDetails('accountNumber', e.target.value)} />
          </div>
        </section>
      )}

      {/* Notes / Terms */}
      <section className="space-y-3">
        <SectionLabel>{tr.termsAndConditions}</SectionLabel>
        <Textarea
          className="text-sm min-h-[80px] rounded-lg"
          placeholder={tr.notes}
          value={data.notes || ''}
          onChange={e => updateField('notes', e.target.value)}
        />
      </section>
    </div>
  );
};

export default InvoiceForm;
