import { useLanguage } from '@/contexts/LanguageContext';
import { ProposalData } from '@/types/document';
import { formatCurrency } from '@/lib/translations';

interface Props {
  data: ProposalData;
}

const ProposalPreview = ({ data }: Props) => {
  const { docLang, isDocRTL, docTr } = useLanguage();

  return (
    <div
      dir={isDocRTL ? 'rtl' : 'ltr'}
      className={`bg-background shadow-card rounded-xl max-w-[800px] w-full mx-auto p-8 md:p-10 ${isDocRTL ? 'font-cairo' : 'font-inter'} text-foreground`}
      style={{ minHeight: '1131px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-start">
          {data.companyLogo && (
            <img src={data.companyLogo} alt="Logo" className="max-h-16 max-w-[180px] rounded-lg object-contain block" style={{ width: 'auto', height: '64px' }} />
          )}
          <div className={data.companyLogo ? (isDocRTL ? 'mr-4' : 'ml-4') : ''}>
            <h1 className="text-2xl font-semibold tracking-tight leading-tight">{data.companyName || '—'}</h1>
            <p className="text-xs text-muted-foreground mt-1">{docTr.proposal}</p>
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
          <p className="font-semibold tabular-nums">{data.proposalNumber || '—'}</p>
          <p className="text-muted-foreground text-xs mt-1">{data.date}</p>
        </div>
      </div>

      {/* Client */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1.5 font-medium">{docTr.clientName}</p>
        <p className="text-sm font-medium">{data.client.name || '—'}</p>
        <p className="text-xs text-muted-foreground">{data.client.email}</p>
        <p className="text-xs text-muted-foreground">{data.client.address}</p>
      </div>

      {/* Executive Summary */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-2">{docTr.executiveSummary}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">{data.executiveSummary}</p>
      </div>

      {/* Scope of Work */}
      {data.scopeOfWork.some(s => s.trim()) && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-2">{docTr.scopeOfWork}</h2>
          <ul className={`space-y-1.5 text-xs text-muted-foreground ${isDocRTL ? 'pr-4' : 'pl-4'}`}>
            {data.scopeOfWork.filter(s => s.trim()).map((item, i) => (
              <li key={i} className="list-disc">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      {data.timeline.some(t => t.milestone.trim()) && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-2">{docTr.timeline}</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary">
                <th className={`p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${isDocRTL ? 'text-right rounded-r-md' : 'text-left rounded-l-md'}`}>{docTr.milestone}</th>
                <th className={`p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${isDocRTL ? 'text-left rounded-l-md' : 'text-right rounded-r-md'}`}>{docTr.date}</th>
              </tr>
            </thead>
            <tbody>
              {data.timeline.filter(t => t.milestone.trim()).map((m, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td className={`p-2.5 font-medium ${isDocRTL ? 'text-right' : 'text-left'}`}>{m.milestone}</td>
                  <td className={`p-2.5 tabular-nums text-muted-foreground ${isDocRTL ? 'text-left' : 'text-right'}`}>{m.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pricing */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold mb-2">{docTr.pricing}</h2>
        <div className="bg-secondary rounded-xl p-5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{docTr.totalCost}</span>
            <span className="text-lg font-semibold tabular-nums">{formatCurrency(data.totalCost, data.currency, docLang)}</span>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="border-t border-border/60 pt-8">
        <h2 className="text-sm font-semibold mb-6">{docTr.signatureArea}</h2>
        <div className="grid grid-cols-2 gap-16">
          <div>
            <div className="border-b border-foreground/15 h-12" />
            <p className="text-xs text-muted-foreground mt-1.5">{docTr.clientSignature}</p>
            <p className="text-xs text-muted-foreground">{docTr.date}: _______________</p>
          </div>
          <div>
            <div className="border-b border-foreground/15 h-12" />
            <p className="text-xs text-muted-foreground mt-1.5">{docTr.companyRepresentative}</p>
            <p className="text-xs text-muted-foreground">{docTr.date}: _______________</p>
          </div>
        </div>
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

export default ProposalPreview;
