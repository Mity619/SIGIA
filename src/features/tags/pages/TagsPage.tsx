// src/features/tags/pages/TagsPage.tsx
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGroups } from "../hooks/useGroups";
import { useCreateGroup } from "../hooks/useCreateGroup";
import { useDeleteGroup } from "../hooks/useDeleteGroup";
import { GroupForm } from "../components/GroupForm";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useCollection } from "@/firebase/hooks/useCollection";
import { normalizeText } from "@/domain";
import type { GroupDoc } from "../types/tags.types";
import type { GroupSchema } from "../schemas/group.schema";
import { useSnackbar } from "notistack";

export function TagsPage() {
  const { getUserId } = useAuth();
  const uid = getUserId()!;
  const { enqueueSnackbar } = useSnackbar();

  const { groups, loading } = useGroups(uid);
  const { create, loading: creating } = useCreateGroup(uid);
  const { remove, deleting } = useDeleteGroup(uid);

  // Hook para editar
  const groupsCol = useCollection<GroupDoc>(`users/${uid}/groups`);

  const [groupToEdit, setGroupToEdit] = useState<GroupDoc | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupDoc | null>(null);

  // Nombres únicos sin distinguir mayúsculas ni tildes ("Café" = "cafe")
  const isNameTaken = (name: string) =>
    groups.some((g) => g.id !== groupToEdit?.id && normalizeText(g.name) === normalizeText(name));

  // Manejar Creación o Edición
  const handleSubmit = async (data: GroupSchema): Promise<boolean> => {
    if (groupToEdit) {
      // Modo Edición
      const success = await groupsCol.update(groupToEdit.id!, data);
      if (success) {
        enqueueSnackbar("Grupo actualizado.", { variant: "success" });
        setGroupToEdit(null);
      } else {
        enqueueSnackbar("No se pudo actualizar el grupo.", { variant: "error" });
      }
      return success;
    }
    // Modo Creación
    return Boolean(await create(data));
  };

  // Manejar Eliminación: también quita el grupo de conceptos y movimientos
  const handleDelete = async () => {
    if (!groupToDelete) return;
    const success = await remove(groupToDelete.id!);
    if (success) {
      if (groupToEdit?.id === groupToDelete.id) setGroupToEdit(null);
      setGroupToDelete(null);
    }
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
            isNameTaken={isNameTaken}
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
                    <i className={`${g.iconKey} text-xl`} aria-hidden="true" />
                    <span>{g.name}</span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGroupToEdit(g)}
                      aria-label={`Editar grupo ${g.name}`}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    >
                      <i className="ri-edit-line text-lg" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupToDelete(g)}
                      aria-label={`Eliminar grupo ${g.name}`}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <i className="ri-delete-bin-line text-lg" aria-hidden="true" />
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
        title={`¿Eliminar el grupo «${groupToDelete?.name ?? ""}»?`}
        description="Esta acción no se puede deshacer. Tus gastos e ingresos no se borran, pero dejarán de tener este grupo."
        confirmText="Sí, eliminar"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
