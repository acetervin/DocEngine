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

interface DuplicateDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docNumber: string;
  newDocNumber: string;
  onConfirm: () => void;
}

const DuplicateDocDialog = ({ open, onOpenChange, docNumber, newDocNumber, onConfirm }: DuplicateDocDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate Document</AlertDialogTitle>
          <AlertDialogDescription>
            A copy of <strong className="text-foreground font-mono">{docNumber}</strong> will be created with a new number <strong className="text-foreground font-mono">{newDocNumber}</strong>. You can edit the copy before saving.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Duplicate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DuplicateDocDialog;
