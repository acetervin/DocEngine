import { useState, useCallback, useEffect } from 'react';
import { SavedClient, ClientInfo } from '@/types/document';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const STORAGE_KEY = 'docengine_clients';

export const useClientStore = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [loading, setLoading] = useState(false);

  // Load clients from localStorage on mount
  useEffect(() => {
    if (!user) {
      setClients([]);
      return;
    }

    setLoading(true);
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        setClients(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveClient = useCallback(async (client: Omit<SavedClient, 'id' | 'createdAt'> | SavedClient) => {
    if (!user) {
      toast.error('Please sign in to save clients.');
      return false;
    }

    try {
      let newClients: SavedClient[];

      // Check if updating existing or creating new
      if ('id' in client && client.id) {
        // Update existing
        newClients = clients.map(c => c.id === client.id ? (client as SavedClient) : c);
      } else {
        // Create new
        const newClient: SavedClient = {
          ...client,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        } as SavedClient;
        newClients = [...clients, newClient];
      }

      setClients(newClients);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(newClients));
      toast.success('Client saved successfully!');
      return true;
    } catch (error) {
      console.error('Failed to save client:', error);
      toast.error('Failed to save client.');
      return false;
    }
  }, [clients, user]);

  const deleteClient = useCallback(async (id: string) => {
    if (!user) {
      toast.error('Please sign in to delete clients.');
      return false;
    }

    try {
      const newClients = clients.filter(c => c.id !== id);
      setClients(newClients);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(newClients));
      toast.success('Client deleted.');
      return true;
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client.');
      return false;
    }
  }, [clients, user]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const newClients = clients.map(c =>
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
      );
      setClients(newClients);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(newClients));
      return true;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  }, [clients, user]);

  const getFavorites = useCallback(() => {
    return clients.filter(c => c.isFavorite).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const getAllClients = useCallback(() => {
    return clients.sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  return {
    clients,
    loading,
    saveClient,
    deleteClient,
    toggleFavorite,
    getFavorites,
    getAllClients,
  };
};
