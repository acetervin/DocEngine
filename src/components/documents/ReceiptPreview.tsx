import { useLanguage } from '@/contexts/LanguageContext';
import { ReceiptData } from '@/types/document';
import { formatCurrency } from '@/lib/translations';

interface Props {
  data: ReceiptData;
  total: number;
}

const ReceiptPreview = ({ data, total }: Props) => {
  const { docLang, isDocRTL, docTr } = useLanguage();

  const paymentMethodLabels: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    mpesa: 'M-Pesa',
    stripe: 'Stripe',
    cash: 'Cash',
  };

  return (
    <div
      dir={isDocRTL ? 'rtl' : 'ltr'}
      className={`bg-background shadow-card rounded-xl max-w-[800px] w-full mx-auto p-8 md:p-10 relative overflow-hidden ${isDocRTL ? 'font-cairo' : 'font-inter'} text-foreground`}
      style={{ minHeight: '1131px' }}
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="flex flex-col items-center -rotate-12">
          <div className="border-[6px] border-green-600/30 rounded-2xl p-2">
            <div className="border-[2px] border-green-600/30 rounded-xl px-10 py-4 flex flex-col items-center gap-1">
              <span className="text-5xl font-black tracking-[0.25em] text-green-600/40 uppercase">
                PAID
              </span>
              <span className="text-xs font-semibold tracking-[0.2em] text-green-600/30 uppercase">
                {docTr.paymentConfirmed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-10 relative z-10">
        <div className="flex items-start gap-4">
          {data.companyLogo && (
            <img src={data.companyLogo} alt="Logo" className="max-h-16 max-w-[180px] rounded-lg object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{data.companyName || '—'}</h1>
            <p className="text-xs text-muted-foreground mt-1">{docTr.receipt}</p>
            {data.companyAddress && <p className="text-xs text-muted-foreground mt-0.5">{data.companyAddress}</p>}
            {(data.companyPhone || data.companyEmail) && (
              <p className="text-xs text-muted-foreground">
                {[data.companyPhone, data.companyEmail].filter(Boolean).join(' • ')}
              </p>
            )}
            {data.companyTaxId && (
              <p className="text-xs text-muted-foreground">{docTr.taxId}: {data.companyTaxId}</p>
            )}
          </div>
        </div>
        <div className={`text-sm ${isDocRTL ? 'text-left' : 'text-right'}`}>
          <p className="font-semibold tabular-nums">{data.receiptNumber || '—'}</p>
          <p className="text-muted-foreground text-xs mt-1">{data.date}</p>
        </div>
      </div>

      {/* Client */}
      <div className="mb-8 relative z-10">
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1.5 font-medium">{docTr.clientName}</p>
        <p className="text-sm font-medium">{data.client.name || '—'}</p>
        <p className="text-xs text-muted-foreground">{data.client.email}</p>
      </div>

      {/* Items */}
      <table className="w-full text-sm mb-8 relative z-10">
        <thead>
          <tr className="bg-secondary">
            <th className={`p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${isDocRTL ? 'text-right rounded-r-md' : 'text-left rounded-l-md'}`}>{docTr.description}</th>
            <th className="p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">{docTr.quantity}</th>
            <th className={`p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${isDocRTL ? 'text-left' : 'text-right'}`}>{docTr.unitPrice}</th>
            <th className={`p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${isDocRTL ? 'text-left rounded-l-md' : 'text-right rounded-r-md'}`}>{docTr.total}</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item) => (
            <tr key={item.id} className="border-b border-border/40">
              <td className={`p-2.5 font-medium text-[13px] ${isDocRTL ? 'text-right' : 'text-left'}`}>{isDocRTL ? (item.descriptionAr || item.description) : item.description}</td>
              <td className="p-2.5 text-center tabular-nums text-muted-foreground">{item.quantity}</td>
              <td className={`p-2.5 tabular-nums text-muted-foreground ${isDocRTL ? 'text-left' : 'text-right'}`}>{formatCurrency(item.unitPrice, data.currency, docLang)}</td>
              <td className={`p-2.5 tabular-nums font-medium ${isDocRTL ? 'text-left' : 'text-right'}`}>{formatCurrency(item.quantity * item.unitPrice, data.currency, docLang)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Summary */}
      <div className="bg-secondary rounded-xl p-6 relative z-10 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{docTr.amountPaid}</span>
          <span className="text-lg font-semibold tabular-nums">{formatCurrency(total, data.currency, docLang)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{docTr.paymentMethod}</span>
          <span className="font-medium text-foreground">{paymentMethodLabels[data.paymentMethod]}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{docTr.transactionRef}</span>
          <span className="tabular-nums font-medium text-foreground">{data.transactionRef}</span>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mt-6 pt-6 border-t border-border/60 relative z-10">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2 font-medium">{docTr.notes}</p>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{data.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ReceiptPreview;
