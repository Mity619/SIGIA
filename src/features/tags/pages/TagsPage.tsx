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
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";

const groupListClass = "flex flex-col gap-2";
const groupRowClass = "flex items-center justify-between rounded-lg border p-3";
const groupNameClass = "flex items-center gap-2";
const groupIconTextClass = "text-xl";
const groupActionsClass = "flex items-center gap-2";
// Editar y eliminar.
const GROUP_ACTION_COUNT = 2;
const GROUP_SKELETON_ROWS = 3;

const GroupListSkeleton = () => (
  <LoadingRegion className={groupListClass} label="Cargando grupos">
    {Array.from({ length: GROUP_SKELETON_ROWS }, (_, index) => (
      <div key={index} className={`${groupRowClass} bg-card`}>
        <div className={groupNameClass}>
          <SkeletonText className={groupIconTextClass} barClassName="w-5" />
          <SkeletonText barClassName="w-28" />
        </div>
        <div className={groupActionsClass}>
          {Array.from({ length: GROUP_ACTION_COUNT }, (_, actionIndex) => (
            <Skeleton key={actionIndex} className="size-11 rounded-lg" />
          ))}
        </div>
      </div>
    ))}
  </LoadingRegion>
);

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
      <h1 className="mb-6 text-2xl font-bold text-foreground">Etiquetas y Grupos</h1>

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
          {loading ? <GroupListSkeleton /> : (
            <div className={groupListClass}>
              {groups.map(g => (
                <div key={g.id} className={`${groupRowClass} bg-card`}>
                  <div className={groupNameClass}>
                    <i className={`${g.iconKey} ${groupIconTextClass}`} aria-hidden="true" />
                    <span>{g.name}</span>
                  </div>

                  {/* Botones de acción */}
                  <div className={groupActionsClass}>
                    <button
                      type="button"
                      onClick={() => setGroupToEdit(g)}
                      aria-label={`Editar grupo ${g.name}`}
                      className="p-2 text-caribe hover:bg-caribe/10 rounded-lg transition"
                    >
                      <i className="ri-edit-line text-lg" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupToDelete(g)}
                      aria-label={`Eliminar grupo ${g.name}`}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
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
