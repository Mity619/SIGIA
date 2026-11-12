// src/features/items/pages/NewEntryPage.tsx
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useItems } from "../hooks/useItems";
import { useGroups } from "@/features/tags/hooks/useGroups";
import { useAccount } from "@/features/accounts/hooks/useAccount";
import { useCreateEntry } from "../hooks/useCreateEntry";
import { EntryForm } from "../components/EntryForm";
import type { TransactionType } from "../types/items.types";
import { useNavigate } from "react-router-dom";

export function NewEntryPage({ type }: { type: TransactionType }) {
  const { getUserId } = useAuth();
  const uid = getUserId()!;
  const navigate = useNavigate();

  const { items } = useItems(uid, type);
  const { groups } = useGroups(uid);
  const { accounts } = useAccount(); // 👈 Traemos las cuentas

  const { submit, saving } = useCreateEntry(uid);

  const handleSubmit = async (values: any) => {
    const success = await submit({
      ...values,
      type,
      newItem: values.itemId ? undefined : {
        name: values.name,
        type: type,
        frequency: values.frequency,
      }
    });

    if (success) {
      navigate(type === 'expense' ? '/gastos' : '/ingresos');
    }
    return success;
  };

  return (
    <div className="mx-auto w-full max-w-lg p-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-[#200020]">
          Nuevo {type === 'expense' ? 'Gasto' : 'Ingreso'}
        </h1>
        
        <EntryForm
          type={type}
          items={items}
          groups={groups}
          accounts={accounts}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </div>
    </div>
  );
}