import { useState, useCallback } from 'react';
import { ReceiptData, LineItem, PaymentMethod } from '@/types/document';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultData: ReceiptData = {
  companyName: '',
  receiptNumber: '',
  date: new Date().toISOString().split('T')[0],
  client: {
    name: '',
    email: '',
    address: '',
  },
  lineItems: [
    { id: generateId(), description: '', descriptionAr: '', quantity: 1, unitPrice: 0, taxable: true },
  ],
  amountPaid: 0,
  currency: 'KWD',
  paymentMethod: 'bank_transfer',
  transactionRef: '',
  notes: '',
};

export const useReceiptData = () => {
  const [data, setData] = useState<ReceiptData>(defaultData);

  const updateField = useCallback(<K extends keyof ReceiptData>(field: K, value: ReceiptData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateClient = useCallback((field: keyof ReceiptData['client'], value: string) => {
    setData(prev => ({ ...prev, client: { ...prev.client, [field]: value } }));
  }, []);

  const updateLineItem = useCallback((id: string, field: keyof LineItem, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const addLineItem = useCallback(() => {
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: generateId(), description: '', descriptionAr: '', quantity: 1, unitPrice: 0, taxable: true }],
    }));
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setData(prev => ({ ...prev, lineItems: prev.lineItems.filter(item => item.id !== id) }));
  }, []);

  const resetData = useCallback(() => {
    setData({
      ...defaultData,
      lineItems: [{ id: generateId(), description: '', descriptionAr: '', quantity: 1, unitPrice: 0, taxable: true }],
    });
  }, []);

  const total = data.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return { data, total, setData, updateField, updateClient, updateLineItem, addLineItem, removeLineItem, resetData };
};
