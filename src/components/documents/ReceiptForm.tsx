import { useLanguage } from '@/contexts/LanguageContext';
import { ReceiptData, LineItem, Currency, PaymentMethod, CompanyProfile } from '@/types/document';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: ReceiptData;
  updateField: <K extends keyof ReceiptData>(f: K, v: ReceiptData[K]) => void;
  updateClient: (f: keyof ReceiptData['client'], v: string) => void;
  updateLineItem: (id: string, f: keyof LineItem, v: string | number | boolean) => void;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  companyProfile: CompanyProfile;
  onUpdateCompanyName: (name: string) => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground pb-1 border-b border-border/40 mb-3">{children}</h4>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{children}</label>
);

const ReceiptForm = ({ data, updateField, updateClient, updateLineItem, addLineItem, removeLineItem, companyProfile, onUpdateCompanyName }: Props) => {
  const { tr } = useLanguage();

  return (
    <div className="space-y-6 p-5 overflow-y-auto h-full scrollbar-thin">
      {/* Company Profile */}
      <section className="space-y-3">
        <SectionLabel>{tr.companyProfile}</SectionLabel>
        <div className="flex items-center gap-3">
          {companyProfile.logo && (
            <img src={companyProfile.logo} alt="Logo" className="h-12 w-12 rounded-lg object-contain border border-border" />
          )}
          <div className="flex-1">
            <FieldLabel>{tr.companyName}</FieldLabel>
            <Input className="h-9 text-sm rounded-lg" value={companyProfile.companyName} onChange={e => onUpdateCompanyName(e.target.value)} />
          </div>
        </div>
        {(companyProfile.address || companyProfile.phone || companyProfile.email) && (
          <div className="text-xs text-muted-foreground space-y-0.5 pl-1">
            {companyProfile.address && <p>{companyProfile.address}</p>}
            <p>{[companyProfile.phone, companyProfile.email].filter(Boolean).join(' • ')}</p>
            {companyProfile.taxId && <p>{tr.taxId}: {companyProfile.taxId}</p>}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionLabel>{tr.documentBuilder}</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel>{tr.date}</FieldLabel>
            <Input type="date" className="h-9 text-sm rounded-lg" value={data.date} onChange={e => updateField('date', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{tr.currency}</FieldLabel>
            <Select value={data.currency} onValueChange={v => updateField('currency', v as Currency)}>
              <SelectTrigger className="h-9 text-sm rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="KWD">KWD</SelectItem>
                <SelectItem value="KES">KES</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>{tr.paymentMethod}</FieldLabel>
            <Select value={data.paymentMethod} onValueChange={v => updateField('paymentMethod', v as PaymentMethod)}>
              <SelectTrigger className="h-9 text-sm rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {data.receiptNumber && (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{tr.receiptNumber}:</span>
            <span className="text-sm font-semibold tabular-nums">{data.receiptNumber}</span>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionLabel>{tr.clientInfo}</SectionLabel>
        <Input className="h-9 text-sm rounded-lg" placeholder={tr.clientName} value={data.client.name} onChange={e => updateClient('name', e.target.value)} />
        <Input className="h-9 text-sm rounded-lg" placeholder={tr.email} value={data.client.email} onChange={e => updateClient('email', e.target.value)} />
      </section>

      <section className="space-y-3">
        <SectionLabel>{tr.lineItems}</SectionLabel>
        {data.lineItems.map((item) => (
          <div key={item.id} className="flex gap-2 items-end animate-fade-in">
            <div className="flex-1 min-w-0">
              <Input className="h-9 text-sm rounded-lg" value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} />
            </div>
            <div className="w-14 shrink-0">
              <Input type="number" className="h-9 text-sm tabular-nums rounded-lg" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', Number(e.target.value))} />
            </div>
            <div className="w-20 shrink-0">
              <Input type="number" className="h-9 text-sm tabular-nums rounded-lg" value={item.unitPrice} onChange={e => updateLineItem(item.id, 'unitPrice', Number(e.target.value))} />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive rounded-lg" onClick={() => removeLineItem(item.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-lg w-full" onClick={addLineItem}>
          <Plus className="h-3.5 w-3.5" />{tr.addItem}
        </Button>
      </section>

      <section className="space-y-3">
        <div>
          <FieldLabel>{tr.transactionRef}</FieldLabel>
          <Input className="h-9 text-sm rounded-lg" value={data.transactionRef} onChange={e => updateField('transactionRef', e.target.value)} />
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-3">
        <SectionLabel>{tr.notes}</SectionLabel>
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

export default ReceiptForm;
