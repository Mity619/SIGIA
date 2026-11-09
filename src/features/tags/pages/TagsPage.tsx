// src/features/tags/pages/TagsPage.tsx
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGroups } from "../hooks/useGroups";
import { useCreateGroup } from "../hooks/useCreateGroup";
import { GroupForm } from "../components/GroupForm";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useCollection } from "@/firebase/hooks/useCollection";
import type { GroupDoc } from "../types/tags.types";
import { useSnackbar } from "notistack";

export function TagsPage() {
  const { getUserId } = useAuth();
  const uid = getUserId()!;
  const { enqueueSnackbar } = useSnackbar();
  
  const { groups, loading } = useGroups(uid);
  const { create, loading: creating } = useCreateGroup(uid);
  
  // Hooks para editar y eliminar
  const groupsCol = useCollection<GroupDoc>(`users/${uid}/groups`);
  
  const [groupToEdit, setGroupToEdit] = useState<GroupDoc | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  // Manejar Creación o Edición
  const handleSubmit = async (data: any) => {
    if (groupToEdit) {
      // Modo Edición
      const success = await groupsCol.update(groupToEdit.id!, data);
      if (success) {
        enqueueSnackbar("Grupo actualizado", { variant: "success" });
        setGroupToEdit(null);
      } else {
        enqueueSnackbar("Error al actualizar", { variant: "error" });
      }
    } else {
      // Modo Creación
      await create(data);
    }
  };

  // Manejar Eliminación
  const handleDelete = async () => {
    if (!groupToDelete) return;
    const success = await groupsCol.remove(groupToDelete);
    if (success) {
      enqueueSnackbar("Grupo eliminado", { variant: "success" });
    } else {
      enqueueSnackbar("Error al eliminar", { variant: "error" });
    }
    setGroupToDelete(null);
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-[#200020]">Etiquetas y Grupos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="rounded-2xl border p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4">
            {groupToEdit ? "Editar grupo" : "Crear nuevo grupo"}
          </h2>
          <GroupForm 
            onSubmit={handleSubmit} 
            loading={creating || groupsCol.isPending} 
            initialData={groupToEdit}
            onCancel={groupToEdit ? () => setGroupToEdit(null) : undefined}
          />
        </div>
        
        {/* Lista de Grupos */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Mis grupos</h2>
          {loading ? <p>Cargando...</p> : (
            <div className="flex flex-col gap-2">
              {groups.map(g => (
                <div key={g.id} className="flex items-center justify-between rounded-lg border p-3 bg-white">
                  <div className="flex items-center gap-2">
                    <i className={`${g.iconKey} text-xl`} />
                    <span>{g.name}</span>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setGroupToEdit(g)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    >
                      <i className="ri-edit-line text-lg" />
                    </button>
                    <button 
                      onClick={() => setGroupToDelete(g.id!)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <i className="ri-delete-bin-line text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación para eliminar */}
      <ConfirmDialog
        open={!!groupToDelete}
        onOpenChange={(open) => !open && setGroupToDelete(null)}
        title="¿Eliminar grupo?"
        description="Esta acción no se puede deshacer. Los movimientos asociados a este grupo no se borrarán, pero perderán esta etiqueta."
        confirmText="Sí, eliminar"
        isDestructive
        onConfirm={handleDelete}
      />
    </div>
  );
}