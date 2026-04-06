import { useState } from 'react';
import { Heart, Trash2, Edit, Plus, Search } from 'lucide-react';
import { SavedClient } from '@/types/document';
import { Input } from '@/components/ui/input';
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
import ClientDialog from '@/components/documents/ClientDialog';
import { useClientStore } from '@/hooks/useClientStore';

const ClientsPage = () => {
  const { clients, saveClient, deleteClient, toggleFavorite } = useClientStore();
  const [search, setSearch] = useState('');
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<SavedClient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedClient | null>(null);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const favorites = filtered.filter(c => c.isFavorite).sort((a, b) => a.name.localeCompare(b.name));
  const others = filtered.filter(c => !c.isFavorite).sort((a, b) => a.name.localeCompare(b.name));

  const handleOpenDialog = (client?: SavedClient) => {
    setEditingClient(client || null);
    setClientDialogOpen(true);
  };

  const handleSaveClient = async (client: SavedClient) => {
    return await saveClient(client);
  };

  const handleDeleteClick = (client: SavedClient) => {
    setDeleteTarget(client);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name or email..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="h-9 gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Client</span>
          </Button>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ⭐ Favorites ({favorites.length})
            </h2>
            <div className="space-y-2">
              {favorites.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteClick}
                  onToggleFavorite={() => toggleFavorite(client.id)}
                  isFavorite={client.isFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Clients Section */}
        {others.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              All Clients ({others.length})
            </h2>
            <div className="space-y-2">
              {others.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteClick}
                  onToggleFavorite={() => toggleFavorite(client.id)}
                  isFavorite={client.isFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No clients yet. Start by adding one!</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-3.5 w-3.5 mr-2" />
              Add Your First Client
            </Button>
          </div>
        )}

        {/* Filtered Empty State */}
        {clients.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No clients match your search.
          </div>
        )}
      </div>

      {/* Client Dialog */}
      <ClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        client={editingClient}
        onSave={handleSaveClient}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteTarget) {
                  await deleteClient(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface ClientCardProps {
  client: SavedClient;
  onEdit: (client: SavedClient) => void;
  onDelete: (client: SavedClient) => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

const ClientCard = ({ client, onEdit, onDelete, onToggleFavorite, isFavorite }: ClientCardProps) => {
  return (
    <div className="p-4 rounded-lg border border-border/60 bg-background hover:border-border hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground">{client.name}</h3>
          {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
          {client.address && <p className="text-xs text-muted-foreground mt-1">{client.address}</p>}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite
                ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onEdit(client)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(client)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
