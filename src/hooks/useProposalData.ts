import { useState, useCallback } from 'react';
import { ProposalData, Currency } from '@/types/document';

const defaultData: ProposalData = {
  companyName: '',
  proposalNumber: '',
  date: new Date().toISOString().split('T')[0],
  client: {
    name: '',
    email: '',
    address: '',
  },
  executiveSummary: '',
  scopeOfWork: [''],
  timeline: [{ milestone: '', date: '' }],
  totalCost: 0,
  currency: 'KWD',
};

export const useProposalData = () => {
  const [data, setData] = useState<ProposalData>(defaultData);

  const updateField = useCallback(<K extends keyof ProposalData>(field: K, value: ProposalData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateClient = useCallback((field: keyof ProposalData['client'], value: string) => {
    setData(prev => ({ ...prev, client: { ...prev.client, [field]: value } }));
  }, []);

  const addDeliverable = useCallback(() => {
    setData(prev => ({ ...prev, scopeOfWork: [...prev.scopeOfWork, ''] }));
  }, []);

  const updateDeliverable = useCallback((index: number, value: string) => {
    setData(prev => ({
      ...prev,
      scopeOfWork: prev.scopeOfWork.map((d, i) => i === index ? value : d),
    }));
  }, []);

  const removeDeliverable = useCallback((index: number) => {
    setData(prev => ({ ...prev, scopeOfWork: prev.scopeOfWork.filter((_, i) => i !== index) }));
  }, []);

  const addMilestone = useCallback(() => {
    setData(prev => ({ ...prev, timeline: [...prev.timeline, { milestone: '', date: '' }] }));
  }, []);

  const updateMilestone = useCallback((index: number, field: 'milestone' | 'date', value: string) => {
    setData(prev => ({
      ...prev,
      timeline: prev.timeline.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  }, []);

  const removeMilestone = useCallback((index: number) => {
    setData(prev => ({ ...prev, timeline: prev.timeline.filter((_, i) => i !== index) }));
  }, []);

  const resetData = useCallback(() => {
    setData({
      ...defaultData,
      scopeOfWork: [''],
      timeline: [{ milestone: '', date: '' }],
    });
  }, []);

  return {
    data, setData, updateField, updateClient,
    addDeliverable, updateDeliverable, removeDeliverable,
    addMilestone, updateMilestone, removeMilestone, resetData,
  };
};
