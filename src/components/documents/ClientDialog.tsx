import { useState, useEffect } from 'react';
import { SavedClient, ClientInfo } from '@/types/document';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: SavedClient | null;
  onSave: (client: Omit<SavedClient, 'id' | 'createdAt'> | SavedClient) => Promise<boolean>;
}

const ClientDialog = ({ open, onOpenChange, client, onSave }: ClientDialogProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setAddress(client.address);
    } else {
      setName('');
      setEmail('');
      setAddress('');
    }
  }, [client, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a client name.');
      return;
    }

    setSaving(true);
    try {
      const success = await onSave({
        ...(client ? { id: client.id, createdAt: client.createdAt } : {}),
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        isFavorite: client?.isFavorite || false,
      } as SavedClient);

      if (success) {
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{client ? 'Edit Client' : 'Add New Client'}</AlertDialogTitle>
          <AlertDialogDescription>
            {client ? 'Update the client information.' : 'Add a new client to your list.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Client Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ABC Corporation"
              className="h-9 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="h-9 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Address
            </label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State 12345"
              className="text-sm min-h-[60px]"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving...' : 'Save Client'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClientDialog;
