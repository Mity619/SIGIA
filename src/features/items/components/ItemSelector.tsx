import type { ItemDoc } from "../types/items.types";

interface ItemSelectorProps {
  items: ItemDoc[];
  value: string | undefined;
  onChange: (itemId: string) => void;
  disabled?: boolean;
}

export function ItemSelector({
  items,
  value,
  onChange,
  disabled = false,
}: ItemSelectorProps) {
  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || items.length === 0}
                className="h-11 w-full appearance-none truncate rounded-xl border border-gray-200 bg-gray-50/60 pl-4 pr-10 text-sm text-[#200020] transition focus-visible:border-[#DA0081] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#da008133] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>
          {items.length === 0
            ? "No hay registros previos"
            : "Selecciona un registro anterior..."}
        </option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} (Último: ${item.lastAmount || 0})
          </option>
        ))}
      </select>
      
      {/* Icono de flecha para el select custom */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
        <i className="ri-arrow-down-s-line text-lg" />
      </div>
    </div>
  );
}