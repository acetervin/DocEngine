import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { DocumentType, SavedDocument } from '@/types/document';
import { useLanguage } from '@/contexts/LanguageContext';
import AppSidebar from '@/components/layout/AppSidebar';
import TopBar from '@/components/layout/TopBar';
import DocumentsPage from '@/pages/Documents';
import InvoiceForm from '@/components/documents/InvoiceForm';
import InvoicePreview from '@/components/documents/InvoicePreview';
import ProposalForm from '@/components/documents/ProposalForm';
import ProposalPreview from '@/components/documents/ProposalPreview';
import ReceiptForm from '@/components/documents/ReceiptForm';
import ReceiptPreview from '@/components/documents/ReceiptPreview';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { useProposalData } from '@/hooks/useProposalData';
import { useReceiptData } from '@/hooks/useReceiptData';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { toast } from 'sonner';

const Index = () => {
  const [activeDoc, setActiveDoc] = useState<DocumentType>('invoice');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'form' | 'preview'>('form');
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { tr } = useLanguage();
  const previewRef = useRef<HTMLDivElement>(null);

  const invoice = useInvoiceData();
  const proposal = useProposalData();
  const receipt = useReceiptData();
  const company = useCompanyProfile();
  const store = useDocumentStore();
  const { theme, toggleTheme } = useTheme();

  // Sync company profile → document data
  useEffect(() => {
    const p = company.profile;
    invoice.updateField('companyName', p.companyName);
    proposal.updateField('companyName', p.companyName);
    receipt.updateField('companyName', p.companyName);

    // Sync contact info to all doc types
    invoice.updateField('companyLogo', p.logo);
    invoice.updateField('companyAddress', p.address);
    invoice.updateField('companyPhone', p.phone);
    invoice.updateField('companyEmail', p.email);
    invoice.updateField('companyTaxId', p.taxId);

    proposal.updateField('companyLogo', p.logo);
    proposal.updateField('companyAddress', p.address);
    proposal.updateField('companyPhone', p.phone);
    proposal.updateField('companyEmail', p.email);
    proposal.updateField('companyTaxId', p.taxId);

    receipt.updateField('companyLogo', p.logo);
    receipt.updateField('companyAddress', p.address);
    receipt.updateField('companyPhone', p.phone);
    receipt.updateField('companyEmail', p.email);
    receipt.updateField('companyTaxId', p.taxId);
  }, [company.profile.companyName, company.profile.logo, company.profile.address, company.profile.phone, company.profile.email, company.profile.taxId]);

  useEffect(() => {
    invoice.updateField('bankDetails', company.profile.bankDetails);
  }, [company.profile.bankDetails]);

  useEffect(() => {
    invoice.updateField('paymentMethods', company.profile.paymentMethods);
    if (company.profile.mpesaDetails) {
      invoice.updateField('mpesaDetails', company.profile.mpesaDetails);
    }
  }, [company.profile.paymentMethods, company.profile.mpesaDetails]);

  // Reset saved state when data changes (skip if loading a saved doc)
  const loadingDocRef = useRef(false);
  useEffect(() => {
    if (loadingDocRef.current) {
      loadingDocRef.current = false;
      return;
    }
    setIsSaved(false);
  }, [invoice.data, proposal.data, receipt.data]);

  const docTitles: Record<DocumentType, string> = {
    invoice: tr.invoice,
    proposal: tr.proposal,
    receipt: tr.receipt,
  };

  const handleSave = useCallback(async () => {
    if (currentDocId && isSaved) {
      toast.error('This document has already been saved and cannot be overwritten. Create a new document instead.');
      return;
    }

    if (!company.profile.companyName.trim()) {
      toast.error('Please set a company name in the Company Profile section first.');
      return;
    }

    setSaving(true);
    try {
      const docNumber = currentDocId
        ? (activeDoc === 'invoice' ? invoice.data.invoiceNumber : activeDoc === 'proposal' ? proposal.data.proposalNumber : receipt.data.receiptNumber)
        : company.peekNextDocNumber(activeDoc);

      if (!currentDocId) {
        company.incrementCounter(activeDoc);
      }

      let docData: SavedDocument['data'];
      let total = 0;
      let subtotal: number | undefined;
      let tax: number | undefined;
      let clientName = '';

      if (activeDoc === 'invoice') {
        const updatedData = { ...invoice.data, invoiceNumber: docNumber };
        invoice.updateField('invoiceNumber', docNumber);
        docData = updatedData;
        subtotal = invoice.subtotal;
        tax = invoice.tax;
        total = invoice.total;
        clientName = invoice.data.client.name;
      } else if (activeDoc === 'proposal') {
        const updatedData = { ...proposal.data, proposalNumber: docNumber };
        proposal.updateField('proposalNumber', docNumber);
        docData = updatedData;
        total = proposal.data.totalCost;
        clientName = proposal.data.client.name;
      } else {
        const updatedData = { ...receipt.data, receiptNumber: docNumber };
        receipt.updateField('receiptNumber', docNumber);
        docData = updatedData;
        total = receipt.total;
        clientName = receipt.data.client.name;
      }

      const id = currentDocId || crypto.randomUUID();

      const savedDoc: SavedDocument = {
        id,
        type: activeDoc,
        docNumber,
        companyId: company.profile.id,
        companyName: company.profile.companyName,
        clientName,
        date: activeDoc === 'invoice' ? invoice.data.date : activeDoc === 'proposal' ? proposal.data.date : receipt.data.date,
        data: docData,
        total,
        subtotal,
        tax,
        createdAt: new Date().toISOString(),
      };

      const success = await store.saveDocument(savedDoc);
      if (success) {
        setCurrentDocId(id);
        setIsSaved(true);
        toast.success(`Document ${docNumber} saved successfully!`);
      }
    } finally {
      setSaving(false);
    }
  }, [activeDoc, currentDocId, isSaved, invoice, proposal, receipt, company, store]);

  const handleExportPdf = useCallback(async () => {
    if (!isSaved) {
      toast.error('Please save the document first before downloading.');
      return;
    }

    const el = previewRef.current;
    if (!el) return;

    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const docNumber = activeDoc === 'invoice' ? invoice.data.invoiceNumber 
        : activeDoc === 'proposal' ? proposal.data.proposalNumber 
        : receipt.data.receiptNumber;

      const root = document.documentElement;
      const wasDark = root.classList.contains('dark');
      if (wasDark) root.classList.remove('dark');

      try {
        await html2pdf()
          .set({
            margin: [0, 0, 0, 0],
            filename: `${docNumber || activeDoc}-${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2, 
              useCORS: true,
              logging: false,
              windowWidth: 800,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          })
          .from(el)
          .save();
      } finally {
        if (wasDark) root.classList.add('dark');
      }
    } finally {
      setDownloading(false);
    }
  }, [activeDoc, isSaved, invoice.data.invoiceNumber, proposal.data.proposalNumber, receipt.data.receiptNumber]);

  const handleNewDoc = useCallback(() => {
    setCurrentDocId(null);
    setIsSaved(false);
    if (activeDoc === 'invoice') invoice.resetData();
    else if (activeDoc === 'proposal') proposal.resetData();
    else receipt.resetData();

    // Re-sync company data
    const p = company.profile;
    setTimeout(() => {
      if (activeDoc === 'invoice') {
        invoice.updateField('companyName', p.companyName);
        invoice.updateField('bankDetails', p.bankDetails);
        invoice.updateField('paymentMethods', p.paymentMethods);
        if (p.mpesaDetails) invoice.updateField('mpesaDetails', p.mpesaDetails);
        invoice.updateField('companyLogo', p.logo);
        invoice.updateField('companyAddress', p.address);
        invoice.updateField('companyPhone', p.phone);
        invoice.updateField('companyEmail', p.email);
        invoice.updateField('companyTaxId', p.taxId);
      } else if (activeDoc === 'proposal') {
        proposal.updateField('companyName', p.companyName);
        proposal.updateField('companyLogo', p.logo);
        proposal.updateField('companyAddress', p.address);
        proposal.updateField('companyPhone', p.phone);
        proposal.updateField('companyEmail', p.email);
        proposal.updateField('companyTaxId', p.taxId);
      } else {
        receipt.updateField('companyName', p.companyName);
        receipt.updateField('companyLogo', p.logo);
        receipt.updateField('companyAddress', p.address);
        receipt.updateField('companyPhone', p.phone);
        receipt.updateField('companyEmail', p.email);
        receipt.updateField('companyTaxId', p.taxId);
      }
    }, 0);
  }, [activeDoc, company.profile, invoice, proposal, receipt]);

  const handleLoadDoc = useCallback((doc: SavedDocument) => {
    setShowAllDocs(false);
    setActiveDoc(doc.type);
    setCurrentDocId(doc.id);
    setIsSaved(true);
    loadingDocRef.current = true;

    if (doc.type === 'invoice') {
      invoice.setData(doc.data as any);
    } else if (doc.type === 'proposal') {
      proposal.setData(doc.data as any);
    } else {
      receipt.setData(doc.data as any);
    }
  }, [invoice, proposal, receipt]);

  const handleDeleteDoc = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await store.deleteDocument(id);
    } finally {
      setDeletingId(null);
    }
  }, [store]);

  const handleGenerateNextNumber = useCallback(() => {
    const nextNum = company.peekNextDocNumber(activeDoc);
    if (activeDoc === 'invoice') invoice.updateField('invoiceNumber', nextNum);
    else if (activeDoc === 'proposal') proposal.updateField('proposalNumber', nextNum);
    else receipt.updateField('receiptNumber', nextNum);
  }, [activeDoc, company, invoice, proposal, receipt]);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <AppSidebar
        activeDoc={activeDoc}
        onSelectDoc={(type) => { setShowAllDocs(false); setActiveDoc(type); setCurrentDocId(null); setIsSaved(false); }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        savedDocuments={store.documents}
        onLoadDoc={handleLoadDoc}
        onDeleteDoc={handleDeleteDoc}
        onViewAllDocs={() => setShowAllDocs(true)}
        showingAllDocs={showAllDocs}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          title={showAllDocs ? 'All Documents' : docTitles[activeDoc]}
          onExportPdf={handleExportPdf}
          onSave={handleSave}
          onNewDoc={() => { setShowAllDocs(false); handleNewDoc(); }}
          onToggleSidebar={() => setSidebarOpen(true)}
          activePanel={activePanel}
          onTogglePanel={setActivePanel}
          isSaved={isSaved}
          currentDocNumber={
            activeDoc === 'invoice' ? invoice.data.invoiceNumber
              : activeDoc === 'proposal' ? proposal.data.proposalNumber
              : receipt.data.receiptNumber
          }
          theme={theme}
          onToggleTheme={toggleTheme}
          saving={saving}
          downloading={downloading}
          showAllDocs={showAllDocs}
        />

        {showAllDocs ? (
          <DocumentsPage
            documents={store.documents}
            onLoadDoc={handleLoadDoc}
            onDeleteDoc={handleDeleteDoc}
            loading={store.loading}
            deleting={deletingId}
          />
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Form Pane */}
            <div
              className={`w-full lg:w-[420px] lg:max-w-[420px] shrink-0 border-r border-border/60 bg-background overflow-hidden ${
                activePanel === 'form' ? 'block' : 'hidden lg:block'
              }`}
            >
              {activeDoc === 'invoice' && (
                <InvoiceForm
                  data={invoice.data}
                  updateField={invoice.updateField}
                  updateClient={invoice.updateClient}
                  updateLineItem={invoice.updateLineItem}
                  addLineItem={invoice.addLineItem}
                  removeLineItem={invoice.removeLineItem}
                  updateDiscount={invoice.updateDiscount}
                  companyProfile={company.profile}
                  onUpdateCompanyName={company.updateCompanyName}
                  onUpdateCompanyField={company.updateField}
                  onUpdateBankDetails={company.updateBankDetails}
                  onUpdateMpesaDetails={company.updateMpesaDetails}
                  onTogglePaymentMethod={company.togglePaymentMethod}
                />
              )}
              {activeDoc === 'proposal' && (
                <ProposalForm
                  data={proposal.data}
                  updateField={proposal.updateField}
                  updateClient={proposal.updateClient}
                  addDeliverable={proposal.addDeliverable}
                  updateDeliverable={proposal.updateDeliverable}
                  removeDeliverable={proposal.removeDeliverable}
                  addMilestone={proposal.addMilestone}
                  updateMilestone={proposal.updateMilestone}
                  removeMilestone={proposal.removeMilestone}
                  companyProfile={company.profile}
                  onUpdateCompanyName={company.updateCompanyName}
                />
              )}
              {activeDoc === 'receipt' && (
                <ReceiptForm
                  data={receipt.data}
                  updateField={receipt.updateField}
                  updateClient={receipt.updateClient}
                  updateLineItem={receipt.updateLineItem}
                  addLineItem={receipt.addLineItem}
                  removeLineItem={receipt.removeLineItem}
                  companyProfile={company.profile}
                  onUpdateCompanyName={company.updateCompanyName}
                />
              )}
            </div>

            {/* Preview Pane */}
            <div
              className={`flex-1 overflow-y-auto p-4 md:p-8 bg-surface scrollbar-thin ${
                activePanel === 'preview' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div ref={previewRef} className="preview-light-override">
                {activeDoc === 'invoice' && (
                  <InvoicePreview data={invoice.data} subtotal={invoice.subtotal} discountAmount={invoice.discountAmount} tax={invoice.tax} total={invoice.total} />
                )}
                {activeDoc === 'proposal' && (
                  <ProposalPreview data={proposal.data} />
                )}
                {activeDoc === 'receipt' && (
                  <ReceiptPreview data={receipt.data} total={receipt.total} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
