import { useState, useRef, useCallback, useEffect } from 'react';
import { DocumentType, SavedDocument, InvoiceData, ProposalData, ReceiptData } from '@/types/document';
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
import SaveWarningDialog from '@/components/documents/SaveWarningDialog';
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
  const [saveWarningOpen, setSaveWarningOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const { tr } = useLanguage();
  const previewRef = useRef<HTMLDivElement>(null);

  const invoice = useInvoiceData();
  const proposal = useProposalData();
  const receipt = useReceiptData();
  const company = useCompanyProfile();
  const store = useDocumentStore();

  const { updateField: updateInvoiceField, setData: setInvoiceData, resetData: resetInvoiceData } = invoice;
  const { updateField: updateProposalField, setData: setProposalData, resetData: resetProposalData } = proposal;
  const { updateField: updateReceiptField, setData: setReceiptData, resetData: resetReceiptData } = receipt;
  const { profile: companyProfile, peekNextDocNumber, incrementCounter } = company;

  // Sync company profile → document data (only for NEW documents)
  useEffect(() => {
    if (currentDocId) return;

    const p = companyProfile;
    updateInvoiceField('companyName', p.companyName);
    updateProposalField('companyName', p.companyName);
    updateReceiptField('companyName', p.companyName);

    updateInvoiceField('companyLogo', p.logo);
    updateInvoiceField('companyAddress', p.address);
    updateInvoiceField('companyPhone', p.phone);
    updateInvoiceField('companyEmail', p.email);
    updateInvoiceField('companyTaxId', p.taxId);

    updateProposalField('companyLogo', p.logo);
    updateProposalField('companyAddress', p.address);
    updateProposalField('companyPhone', p.phone);
    updateProposalField('companyEmail', p.email);
    updateProposalField('companyTaxId', p.taxId);

    updateReceiptField('companyLogo', p.logo);
    updateReceiptField('companyAddress', p.address);
    updateReceiptField('companyPhone', p.phone);
    updateReceiptField('companyEmail', p.email);
    updateReceiptField('companyTaxId', p.taxId);
  }, [companyProfile, updateInvoiceField, updateProposalField, updateReceiptField, currentDocId]);

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

    if (!companyProfile.companyName.trim()) {
      toast.error('Please set a company name first.');
      return;
    }

    // Validate required fields based on document type
    if (activeDoc === 'invoice') {
      if (!invoice.data.client.name.trim()) {
        toast.error('Please enter a client name.');
        return;
      }
      if (invoice.data.lineItems.length === 0) {
        toast.error('Please add at least one line item.');
        return;
      }
      if (!invoice.data.date) {
        toast.error('Please select an invoice date.');
        return;
      }
    } else if (activeDoc === 'proposal') {
      if (!proposal.data.client.name.trim()) {
        toast.error('Please enter a client name.');
        return;
      }
      if (proposal.data.scopeOfWork.length === 0 || proposal.data.timeline.length === 0) {
        toast.error('Please add at least one deliverable and one milestone.');
        return;
      }
      if (proposal.data.totalCost <= 0) {
        toast.error('Please enter a valid total cost.');
        return;
      }
      if (!proposal.data.date) {
        toast.error('Please select a proposal date.');
        return;
      }
    } else if (activeDoc === 'receipt') {
      if (!receipt.data.client.name.trim()) {
        toast.error('Please enter a client name.');
        return;
      }
      if (receipt.data.lineItems.length === 0) {
        toast.error('Please add at least one line item.');
        return;
      }
      if (receipt.data.amountPaid <= 0) {
        toast.error('Please enter a valid amount paid.');
        return;
      }
      if (!receipt.data.paymentMethod) {
        toast.error('Please select a payment method.');
        return;
      }
      if (!receipt.data.transactionRef.trim()) {
        toast.error('Please enter a transaction reference.');
        return;
      }
      if (!receipt.data.date) {
        toast.error('Please select a receipt date.');
        return;
      }
    }

    // Show warning dialog before first save
    if (!currentDocId) {
      setSaveWarningOpen(true);
      setPendingSave(true);
      return;
    }

    // Proceed with save if already saved before
    setSaving(true);
    try {
      const docNumber = currentDocId
        ? (activeDoc === 'invoice' ? invoice.data.invoiceNumber : activeDoc === 'proposal' ? proposal.data.proposalNumber : receipt.data.receiptNumber)
        : peekNextDocNumber(activeDoc);

      if (!currentDocId) {
        incrementCounter(activeDoc);
      }

      let docData: SavedDocument['data'];
      let total = 0;
      let subtotal: number | undefined;
      let tax: number | undefined;
      let clientName = '';

      if (activeDoc === 'invoice') {
        const updatedData = { ...invoice.data, invoiceNumber: docNumber };
        updateInvoiceField('invoiceNumber', docNumber);
        docData = updatedData;
        subtotal = invoice.subtotal;
        tax = invoice.tax;
        total = invoice.total;
        clientName = invoice.data.client.name;
      } else if (activeDoc === 'proposal') {
        const updatedData = { ...proposal.data, proposalNumber: docNumber };
        updateProposalField('proposalNumber', docNumber);
        docData = updatedData;
        total = proposal.data.totalCost;
        clientName = proposal.data.client.name;
      } else {
        const updatedData = { ...receipt.data, receiptNumber: docNumber };
        updateReceiptField('receiptNumber', docNumber);
        docData = updatedData;
        total = receipt.total;
        clientName = receipt.data.client.name;
      }

      const id = currentDocId || crypto.randomUUID();

      const savedDoc: SavedDocument = {
        id,
        type: activeDoc,
        docNumber,
        companyId: companyProfile.id,
        companyName: companyProfile.companyName,
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
  }, [
    activeDoc, currentDocId, isSaved, invoice, proposal, receipt,
    companyProfile, peekNextDocNumber, incrementCounter, store,
    updateInvoiceField, updateProposalField, updateReceiptField
  ]);

  const performSave = useCallback(async () => {
    setSaveWarningOpen(false);
    setPendingSave(false);
    setSaving(true);

    try {
      const docNumber = peekNextDocNumber(activeDoc);
      incrementCounter(activeDoc);

      let docData: SavedDocument['data'];
      let total = 0;
      let subtotal: number | undefined;
      let tax: number | undefined;
      let clientName = '';

      if (activeDoc === 'invoice') {
        const updatedData = { ...invoice.data, invoiceNumber: docNumber };
        updateInvoiceField('invoiceNumber', docNumber);
        docData = updatedData;
        subtotal = invoice.subtotal;
        tax = invoice.tax;
        total = invoice.total;
        clientName = invoice.data.client.name;
      } else if (activeDoc === 'proposal') {
        const updatedData = { ...proposal.data, proposalNumber: docNumber };
        updateProposalField('proposalNumber', docNumber);
        docData = updatedData;
        total = proposal.data.totalCost;
        clientName = proposal.data.client.name;
      } else {
        const updatedData = { ...receipt.data, receiptNumber: docNumber };
        updateReceiptField('receiptNumber', docNumber);
        docData = updatedData;
        total = receipt.total;
        clientName = receipt.data.client.name;
      }

      const id = crypto.randomUUID();

      const savedDoc: SavedDocument = {
        id,
        type: activeDoc,
        docNumber,
        companyId: companyProfile.id,
        companyName: companyProfile.companyName,
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
  }, [
    activeDoc, invoice, proposal, receipt,
    companyProfile, peekNextDocNumber, incrementCounter, store,
    updateInvoiceField, updateProposalField, updateReceiptField
  ]);

  const handleExportPdf = useCallback(async () => {
    if (!isSaved) {
      toast.error('Please save the document first.');
      return;
    }

    const el = previewRef.current;
    if (!el) return;

    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const originalWidth = el.style.width;
      el.style.width = '800px';

      const docNumber = activeDoc === 'invoice' ? invoice.data.invoiceNumber 
        : activeDoc === 'proposal' ? proposal.data.proposalNumber 
        : receipt.data.receiptNumber;

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
              width: 800,
              windowWidth: 800,
            },
            jsPDF: { unit: 'px', format: [800, 1131], orientation: 'portrait' },
          })
          .from(el)
          .save();
      } finally {
        el.style.width = originalWidth;
      }
    } finally {
      setDownloading(false);
    }
  }, [activeDoc, isSaved, invoice.data.invoiceNumber, proposal.data.proposalNumber, receipt.data.receiptNumber]);

  const handleNewDoc = useCallback(() => {
    setCurrentDocId(null);
    setIsSaved(false);
    if (activeDoc === 'invoice') resetInvoiceData();
    else if (activeDoc === 'proposal') resetProposalData();
    else resetReceiptData();
  }, [activeDoc, resetInvoiceData, resetProposalData, resetReceiptData]);

  const handleLoadDoc = useCallback((doc: SavedDocument) => {
    setShowAllDocs(false);
    setActiveDoc(doc.type);
    setCurrentDocId(doc.id);
    setIsSaved(true);
    loadingDocRef.current = true;

    if (doc.type === 'invoice') {
      setInvoiceData(doc.data as InvoiceData);
    } else if (doc.type === 'proposal') {
      setProposalData(doc.data as ProposalData);
    } else {
      setReceiptData(doc.data as ReceiptData);
    }
  }, [setInvoiceData, setProposalData, setReceiptData]);

  const handleDeleteDoc = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await store.deleteDocument(id);
    } finally {
      setDeletingId(null);
    }
  }, [store]);

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
              <div ref={previewRef}>
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

      <SaveWarningDialog
        open={saveWarningOpen}
        onOpenChange={setSaveWarningOpen}
        onConfirm={performSave}
      />
    </div>
  );
};

export default Index;
