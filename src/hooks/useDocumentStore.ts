import { useState, useCallback, useEffect } from 'react';
import { SavedDocument, DocumentType } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useDocumentStore = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(false);

  // Load documents from DB
  useEffect(() => {
    if (!user) { setDocuments([]); return; }

    const fetchDocs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load documents:', error);
      } else if (data) {
        setDocuments(data.map(row => ({
          id: row.id,
          type: row.type as DocumentType,
          docNumber: row.doc_number,
          companyId: row.company_id || '',
          companyName: row.company_name,
          clientName: row.client_name,
          date: row.date,
          data: row.data as any,
          total: row.total ?? undefined,
          subtotal: row.subtotal ?? undefined,
          tax: row.tax ?? undefined,
          createdAt: row.created_at,
        })));
      }
      setLoading(false);
    };

    fetchDocs();
  }, [user]);

  const saveDocument = useCallback(async (doc: SavedDocument) => {
    if (!user) { toast.error('Please sign in to save documents.'); return false; }

    const row = {
      id: doc.id,
      user_id: user.id,
      type: doc.type,
      doc_number: doc.docNumber,
      company_id: doc.companyId || null,
      company_name: doc.companyName,
      client_name: doc.clientName,
      date: doc.date,
      data: doc.data as any,
      total: doc.total ?? null,
      subtotal: doc.subtotal ?? null,
      tax: doc.tax ?? null,
    };

    // Check if document already exists (immutable — no overwrites)
    const existing = documents.find(d => d.id === doc.id);
    if (existing) {
      toast.error('This document has already been saved and cannot be overwritten.');
      return false;
    }

    const { error } = await supabase
      .from('saved_documents')
      .insert(row);

    if (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save document.');
      return false;
    }

    // Update local state
    setDocuments(prev => {
      const idx = prev.findIndex(d => d.id === doc.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = doc;
        return updated;
      }
      return [doc, ...prev];
    });

    return true;
  }, [user]);

  const deleteDocument = useCallback(async (id: string) => {
    if (!user) return;

    // Find the doc to reserve its number
    const doc = documents.find(d => d.id === id);

    const { error } = await supabase.from('saved_documents').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete document.');
      return;
    }

    // Reserve the doc number so it can't be reused
    if (doc) {
      await supabase.from('reserved_doc_numbers').insert({
        user_id: user.id,
        doc_number: doc.docNumber,
      });
    }

    setDocuments(prev => prev.filter(d => d.id !== id));
  }, [user, documents]);

  const getDocumentsByType = useCallback((type: DocumentType) => {
    return documents.filter(d => d.type === type);
  }, [documents]);

  return { documents, saveDocument, deleteDocument, getDocumentsByType, loading };
};
