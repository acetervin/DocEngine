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
import { Checkbox } from '@/components/ui/checkbox';

interface SaveWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const SaveWarningDialog = ({ open, onOpenChange, onConfirm }: SaveWarningDialogProps) => {
  const [understood, setUnderstood] = useState(false);

  const handleConfirm = () => {
    if (understood) {
      onConfirm();
      setUnderstood(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setUnderstood(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Save Document</AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-3 mt-4">
            <p className="font-semibold text-foreground">
              Once saved, this document cannot be edited or deleted.
            </p>
            <p>
              You will only be able to view and download the document. This action is permanent and cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 flex items-center gap-3">
          <Checkbox
            id="understood"
            checked={understood}
            onCheckedChange={(checked) => setUnderstood(!!checked)}
          />
          <label htmlFor="understood" className="text-sm cursor-pointer flex-1">
            I understand that this document cannot be edited or deleted after saving
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!understood}
            className="disabled:opacity-50"
          >
            Save Document
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveWarningDialog;
