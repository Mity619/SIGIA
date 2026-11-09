import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEntriesByItem } from "../hooks/useEntriesByItem";
import { useEditEntry } from "../hooks/useEditEntry";
import { EntryHistory } from "../components/EntryHistory";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";

export function ItemDetailPage() {
  const { id: itemId } = useParams();
  const { getUserId } = useAuth();
  const uid = getUserId();
  
  const { entries, loading } = useEntriesByItem(uid!, itemId!);
  const { remove } = useEditEntry(uid!);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!entryToDelete) return;
    const success = await remove(entryToDelete);
    if (success) {
      setIsConfirmOpen(false);
      setEntryToDelete(null);
    }
  };

  if (loading) return <div className="p-6">Cargando historial...</div>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-[#200020]">Historial del Movimiento</h1>
      
      <EntryHistory 
        entries={entries} 
        onDeleteClick={(id) => { setEntryToDelete(id); setIsConfirmOpen(true); }}
        onEditClick={(entry) => console.log("Abrir modal de edición para", entry)}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="¿Eliminar movimiento?"
        description="Esta acción no se puede deshacer y afectará tus cálculos."
        confirmText="Sí, eliminar"
        isDestructive
        onConfirm={handleDelete}
      />
    </div>
  );
}