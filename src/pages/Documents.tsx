import { useState } from 'react';
import { FileText, ScrollText, Receipt, Trash2, FolderOpen, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DocumentType, SavedDocument } from '@/types/document';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DeleteDocDialog from '@/components/documents/DeleteDocDialog';
import { formatCurrency } from '@/lib/translations';

interface DocumentsPageProps {
  documents: SavedDocument[];
  onLoadDoc: (doc: SavedDocument) => void;
  onDeleteDoc: (id: string) => void;
  loading: boolean;
  deleting: string | null;
}

const typeIcons: Record<DocumentType, typeof FileText> = {
  invoice: FileText,
  proposal: ScrollText,
  receipt: Receipt,
};

const typeColors: Record<DocumentType, string> = {
  invoice: 'bg-primary/10 text-primary',
  proposal: 'bg-accent/80 text-accent-foreground',
  receipt: 'bg-secondary text-secondary-foreground',
};

const DocumentsPage = ({ documents, onLoadDoc, onDeleteDoc, loading, deleting }: DocumentsPageProps) => {
  const { tr } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<SavedDocument | null>(null);

  const filtered = documents.filter((doc) => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch =
      !search ||
      doc.docNumber.toLowerCase().includes(search.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(search.toLowerCase()) ||
      doc.companyName.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{tr.savedDocuments}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doc number, client, or company..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'invoice', 'proposal', 'receipt'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {type === 'all' ? 'All' : tr[`${type}s` as keyof typeof tr]}
              </button>
            ))}
          </div>
        </div>

        {/* Documents list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading documents...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search || filterType !== 'all' ? 'No documents match your filters.' : tr.noSavedDocs}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc) => {
              const Icon = typeIcons[doc.type];
              const isDeleting = deleting === doc.id;
              return (
                <div
                  key={doc.id}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-background hover:border-border hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => onLoadDoc(doc)}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${typeColors[doc.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{doc.docNumber}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {doc.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">
                        {doc.clientName || 'No client'}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">•</span>
                      <span className="text-xs text-muted-foreground">{doc.companyName}</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                    <span className="text-[10px] text-muted-foreground/60">{formatTime(doc.createdAt)}</span>
                  </div>

                  {doc.total != null && (
                    <div className="hidden md:block text-sm font-medium text-foreground tabular-nums shrink-0 min-w-[80px] text-right">
                      {doc.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc); }}
                    disabled={isDeleting}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteDocDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        docNumber={deleteTarget?.docNumber || ''}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteDoc(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};

export default DocumentsPage;
