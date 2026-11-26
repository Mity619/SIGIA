// src/features/tags/components/GroupForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupSchema, type GroupSchema } from "../schemas/group.schema";
import { IconPicker } from "./IconPicker";
import { ToneSelector } from "./ToneSelector";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import type { GroupDoc } from "../types/tags.types";

interface Props {
  /** Devuelve true si se guardó; al crear, el formulario se limpia. */
  onSubmit: (data: GroupSchema) => Promise<boolean>;
  loading: boolean;
  initialData?: GroupDoc | null;
  onCancel?: () => void;
  /** true si ya existe otro grupo con ese nombre (sin distinguir mayúsculas ni tildes). */
  isNameTaken?: (name: string) => boolean;
}

export function GroupForm({ onSubmit, loading, initialData, onCancel, isNameTaken }: Props) {
  const { register, handleSubmit, watch, setValue, reset, setError, formState: { errors } } = useForm<GroupSchema>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", tone: "neutral", iconKey: "" }
  });


  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        tone: initialData.tone,
        iconKey: initialData.iconKey,
      });
    } else {
      reset({ name: "", tone: "neutral", iconKey: "" });
    }
  }, [initialData, reset]);

  const tone = watch("tone");
  const iconKey = watch("iconKey");

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        if (isNameTaken?.(data.name)) {
          setError("name", { message: "Ya tienes un grupo con ese nombre" });
          return;
        }
        const ok = await onSubmit(data);
        // Sin esto, pulsar "Crear Grupo" otra vez creaba un duplicado
        if (ok && !initialData) reset({ name: "", tone: "neutral", iconKey: "" });
      })}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="text-sm font-medium">Nombre del grupo</label>
        <Input {...register("name")} placeholder="Ej. Mascotas" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      
      <div>
        <label className="text-sm font-medium">Color</label>
        <ToneSelector value={tone} onChange={(t) => { setValue("tone", t); setValue("iconKey", ""); }} />
      </div>

      <div>
        <label className="text-sm font-medium">Ícono</label>
        <IconPicker tone={tone} value={iconKey} onChange={(key) => setValue("iconKey", key)} />
        {errors.iconKey && <p className="text-xs text-red-500">El ícono es obligatorio</p>}
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1 bg-[#DA0081] hover:bg-[#E366A7]">
          {initialData ? "Guardar Cambios" : "Crear Grupo"}
        </Button>
      </div>
    </form>
  );
}