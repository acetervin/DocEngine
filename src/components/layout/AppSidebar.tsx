import { useState } from 'react';
import { FileText, Receipt, ScrollText, X, Trash2, FolderOpen, LogOut, Archive, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentType, SavedDocument } from '@/types/document';
import DeleteDocDialog from '@/components/documents/DeleteDocDialog';

interface AppSidebarProps {
  activeDoc: DocumentType;
  onSelectDoc: (type: DocumentType) => void;
  open: boolean;
  onClose: () => void;
  savedDocuments: SavedDocument[];
  onLoadDoc: (doc: SavedDocument) => void;
  onDeleteDoc: (id: string) => void;
  onViewAllDocs: () => void;
  onViewClients: () => void;
  showingAllDocs: boolean;
  showingClients: boolean;
}

const AppSidebar = ({ activeDoc, onSelectDoc, open, onClose, savedDocuments, onLoadDoc, onDeleteDoc, onViewAllDocs, onViewClients, showingAllDocs, showingClients }: AppSidebarProps) => {
  const { tr } = useLanguage();
  const { signOut, user } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<SavedDocument | null>(null);

  const navItems = [
    { type: 'invoice' as DocumentType, icon: FileText, label: tr.invoices },
    { type: 'proposal' as DocumentType, icon: ScrollText, label: tr.proposals },
    { type: 'receipt' as DocumentType, icon: Receipt, label: tr.receipts },
  ];

  const handleSelect = (type: DocumentType) => {
    onSelectDoc(type);
    onClose();
  };

  const recentDocs = savedDocuments.slice(0, 3);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative z-50 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-5 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
              <FileText className="h-4 w-4 text-sidebar-foreground" />
            </div>
            <h1 className="text-base font-semibold tracking-tight">{tr.appName}</h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="px-5 mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-muted">
          Documents
        </p>

        <nav className="px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeDoc === item.type;
            return (
              <button
                key={item.type}
                onClick={() => handleSelect(item.type)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* All Documents */}
        <div className="px-3 mt-4 space-y-2">
          <button
            onClick={() => { onViewAllDocs(); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
              showingAllDocs
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <Archive className="h-4 w-4 shrink-0" />
            <span>All Documents</span>
          </button>

          <button
            onClick={() => { onViewClients(); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
              showingClients
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>Clients</span>
          </button>
        </div>

        {recentDocs.length > 0 && (
          <div className="mt-6 flex-1 overflow-y-auto scrollbar-thin">
            <p className="px-5 mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-muted">
              {tr.savedDocuments}
            </p>
            <div className="px-3 space-y-0.5">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all cursor-pointer"
                  onClick={() => { onLoadDoc(doc); onClose(); }}
                >
                  <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{doc.docNumber}</p>
                    <p className="truncate text-[10px] opacity-60">{doc.clientName || 'No client'}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-sidebar-accent transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign out */}
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-[11px] text-sidebar-muted truncate mb-1">{user?.email}</div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

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
    </>
  );
};

export default AppSidebar;
