import { useState } from 'react';
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
import { Input } from '@/components/ui/input';

interface DeleteDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docNumber: string;
  onConfirm: () => void;
}

const DeleteDocDialog = ({ open, onOpenChange, docNumber, onConfirm }: DeleteDocDialogProps) => {
  const [input, setInput] = useState('');
  const isMatch = input.trim() === docNumber;

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
      setInput('');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setInput(''); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The document number <strong className="text-foreground font-mono">{docNumber}</strong> will be permanently reserved and cannot be reused.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <label className="text-sm text-muted-foreground mb-1.5 block">
            Type <span className="font-mono font-semibold text-foreground">{docNumber}</span> to confirm:
          </label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={docNumber}
            className="font-mono"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isMatch}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDocDialog;
