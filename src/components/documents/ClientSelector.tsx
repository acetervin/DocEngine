import { SavedClient } from '@/types/document';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface ClientSelectorProps {
  clients: SavedClient[];
  onSelectClient: (client: SavedClient) => void;
  onAddNew: () => void;
  placeholder?: string;
}

const ClientSelector = ({
  clients,
  onSelectClient,
  onAddNew,
  placeholder = 'Select or add a client...',
}: ClientSelectorProps) => {
  const favorites = clients.filter(c => c.isFavorite).sort((a, b) => a.name.localeCompare(b.name));
  const others = clients.filter(c => !c.isFavorite).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex gap-2">
      <Select onValueChange={(id) => {
        const client = clients.find(c => c.id === id);
        if (client) onSelectClient(client);
      }}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {favorites.length > 0 && (
            <>
              {favorites.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  ⭐ {client.name}
                </SelectItem>
              ))}
              {others.length > 0 && <div className="my-1 h-px bg-border" />}
            </>
          )}
          {others.map(client => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onAddNew}
        className="h-9 w-9"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default ClientSelector;
