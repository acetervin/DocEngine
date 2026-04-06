import { useLanguage } from '@/contexts/LanguageContext';
import { InvoiceData } from '@/types/document';
import { formatCurrency } from '@/lib/translations';
import { Badge } from '@/components/ui/badge';

interface Props {
  data: InvoiceData;
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
}

const paymentTermsLabels: Record<string, string> = {
  net15: 'Net 15',
  net30: 'Net 30',
  net60: 'Net 60',
  due_on_receipt: 'Due on Receipt',
};

const InvoicePreview = ({ data, subtotal, discountAmount, tax, total }: Props) => {
  const { docLang, isDocRTL, docTr } = useLanguage();

  const hasTaxExemptItems = data.lineItems.some(item => item.taxable === false);

  return (
    <div
      dir={isDocRTL ? 'rtl' : 'ltr'}
      className={`bg-background shadow-card rounded-xl max-w-[800px] w-full mx-auto p-8 md:p-10 ${isDocRTL ? 'font-cairo' : 'font-inter'} text-foreground`}
      style={{ minHeight: '1131px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-start gap-4">
          {data.companyLogo && (
            <img src={data.companyLogo} alt="Logo" className="max-h-16 max-w-[180px] rounded-lg object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{data.companyName || '—'}</h1>
            <p className="text-xs text-muted-foreground mt-1">{docTr.invoice}</p>
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
          <p className="font-semibold tabular-nums">{data.invoiceNumber || '—'}</p>
          <p className="text-muted-foreground text-xs mt-1">{data.date}</p>
          {data.dueDate && (
            <p className="text-muted-foreground text-xs">{docTr.dueDate}: {data.dueDate}</p>
          )}
          {data.paymentTerms && (
            <p className="text-muted-foreground text-xs">{paymentTermsLabels[data.paymentTerms] || data.paymentTerms}</p>
          )}
          <Badge
            className="mt-2 text-[10px] uppercase tracking-wider rounded-full px-2.5 py-0.5 border-0"
            style={{
              backgroundColor: data.status === 'paid' ? '#22c55e' : '#f59e0b',
              color: '#fff',
            }}
          >
            {data.status === 'paid' ? docTr.paid : docTr.pending}
          </Badge>
        </div>
      </div>

      {/* Client */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1.5 font-medium">{docTr.clientName}</p>
        <p className="text-sm font-medium">{data.client.name || '—'}</p>
        <p className="text-xs text-muted-foreground">{data.client.email}</p>
        <p className="text-xs text-muted-foreground">{data.client.address}</p>
      </div>

      {/* Table */}
      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="bg-secondary rounded-lg">
            <th className={`p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${isDocRTL ? 'text-right rounded-r-md' : 'text-left rounded-l-md'}`}>{docTr.description}</th>
            <th className="p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">{docTr.quantity}</th>
            <th className={`p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${isDocRTL ? 'text-left' : 'text-right'}`}>{docTr.unitPrice}</th>
            <th className={`p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${isDocRTL ? 'text-left rounded-l-md' : 'text-right rounded-r-md'}`}>{docTr.total}</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item) => (
            <tr key={item.id} className="border-b border-border/40">
              <td className={`p-2.5 ${isDocRTL ? 'text-right' : 'text-left'}`}>
                <span className="block font-medium text-[13px]">{isDocRTL ? (item.descriptionAr || item.description) : item.description}</span>
                {item.taxable === false && (
                  <span className="text-[10px] text-muted-foreground italic">({docTr.taxExempt})</span>
                )}
              </td>
              <td className="p-2.5 text-center tabular-nums text-muted-foreground">{item.quantity}</td>
              <td className={`p-2.5 tabular-nums text-muted-foreground ${isDocRTL ? 'text-left' : 'text-right'}`}>{formatCurrency(item.unitPrice, data.currency, docLang)}</td>
              <td className={`p-2.5 tabular-nums font-medium ${isDocRTL ? 'text-left' : 'text-right'}`}>{formatCurrency(item.quantity * item.unitPrice, data.currency, docLang)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className={`flex ${isDocRTL ? 'justify-start' : 'justify-end'} mb-10`}>
        <div className="w-56 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{docTr.subtotal}</span>
            <span className="tabular-nums">{formatCurrency(subtotal, data.currency, docLang)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{docTr.discount} {data.discount.type === 'percentage' ? `(${data.discount.value}%)` : ''}</span>
              <span className="tabular-nums">-{formatCurrency(discountAmount, data.currency, docLang)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {docTr.tax} ({data.taxRate}%)
              {hasTaxExemptItems && <span className="text-[10px] italic ml-1">*</span>}
            </span>
            <span className="tabular-nums">{formatCurrency(tax, data.currency, docLang)}</span>
          </div>
          <div className="border-t border-foreground/10 pt-2 flex justify-between font-semibold text-base">
            <span>{docTr.total}</span>
            <span className="tabular-nums">{formatCurrency(total, data.currency, docLang)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border-t border-border/60 pt-6 space-y-6">
        {data.paymentMethods?.includes('bank_transfer') && data.bankDetails.bankName && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-3 font-medium">{docTr.bankDetails}</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{docTr.bankName}</span>
                <span className="font-medium">{data.bankDetails.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{docTr.accountName}</span>
                <span className="font-medium">{data.bankDetails.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{docTr.accountNumber}</span>
                <span className="tabular-nums font-medium">{data.bankDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{docTr.swift}</span>
                <span className="font-medium">{data.bankDetails.swift}</span>
              </div>
            </div>
          </div>
        )}

        {data.paymentMethods?.includes('mpesa') && data.mpesaDetails?.businessNumber && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-3 font-medium">M-PESA</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{docTr.businessName || 'Business Name'}</span>
                <span className="font-medium">{data.mpesaDetails.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{docTr.businessNumber || 'Business Number'}</span>
                <span className="tabular-nums font-medium">{data.mpesaDetails.businessNumber}</span>
              </div>
              {data.mpesaDetails.accountNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{docTr.accountNumber}</span>
                  <span className="tabular-nums font-medium">{data.mpesaDetails.accountNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mt-6 pt-6 border-t border-border/60">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2 font-medium">{docTr.notes}</p>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{data.notes}</p>
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;
