import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Download, Menu, Eye, PenLine, Save, FilePlus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/types/document';

interface TopBarProps {
  title: string;
  onExportPdf: () => void;
  onSave: () => void;
  onSaveAsNew?: () => void;
  onNewDoc: () => void;
  onToggleSidebar: () => void;
  activePanel: 'form' | 'preview';
  onTogglePanel: (panel: 'form' | 'preview') => void;
  isSaved: boolean;
  currentDocNumber: string;
  saving?: boolean;
  downloading?: boolean;
  showAllDocs?: boolean;
  isEditingSavedDoc?: boolean;
}

const TopBar = ({ title, onExportPdf, onSave, onSaveAsNew, onNewDoc, onToggleSidebar, activePanel, onTogglePanel, isSaved, currentDocNumber, saving, downloading, showAllDocs, isEditingSavedDoc }: TopBarProps) => {
  const { uiLang, docLang, setUiLang, setDocLang, tr } = useLanguage();

  return (
    <header className="h-14 border-b border-border/60 flex items-center justify-between px-4 md:px-6 bg-background shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </button>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {!showAllDocs && currentDocNumber && (
          <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">#{currentDocNumber}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile panel toggle - hide when showing all docs */}
        {!showAllDocs && (
          <div className="flex lg:hidden bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => onTogglePanel('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activePanel === 'form' ? 'bg-background shadow-subtle text-foreground' : 'text-muted-foreground'
              }`}
            >
              <PenLine className="h-3 w-3" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => onTogglePanel('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activePanel === 'preview' ? 'bg-background shadow-subtle text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        )}

        {/* Language selectors */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <Select value={uiLang} onValueChange={(v) => setUiLang(v as Language)}>
              <SelectTrigger className="h-7 w-[88px] text-xs border-none bg-secondary shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-[10px] uppercase tracking-wider font-medium">Doc</span>
            <Select value={docLang} onValueChange={(v) => setDocLang(v as Language)}>
              <SelectTrigger className="h-7 w-[88px] text-xs border-none bg-secondary shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons - hide when showing all docs */}
        {!showAllDocs && (
          <>
            <Button variant="outline" size="sm" onClick={onNewDoc} className="h-8 text-xs gap-1.5 rounded-lg">
              <FilePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tr.newDoc}</span>
            </Button>

            {isEditingSavedDoc && isSaved ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveAsNew}
                disabled={saving}
                className="h-8 text-xs gap-1.5 rounded-lg"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save as New'}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={saving}
                className={`h-8 text-xs gap-1.5 rounded-lg ${isSaved ? 'text-success border-success/30' : ''}`}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{saving ? 'Saving...' : isSaved ? tr.saved : tr.save}</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={onExportPdf}
              className="h-8 text-xs gap-1.5 rounded-lg"
              disabled={!isSaved || downloading}
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{downloading ? 'Exporting...' : tr.downloadPdf}</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
