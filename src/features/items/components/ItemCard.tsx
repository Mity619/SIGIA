import type { ItemDoc } from "../types/items.types";
import type { GroupDoc } from "@/features/tags/types/tags.types"; 
import { FrequencyBadge } from "./FrequencyBadge";
import { Link } from "react-router-dom";

interface Props {
  item: ItemDoc;
  type: string;
  groups: GroupDoc[]; 
}

export function ItemCard({ item, type, groups }: Props) {
  // Filtramos solo los grupos a los que pertenece este item
  const itemGroups = groups.filter((g) => item.groupIds?.includes(g.id!));

  return (
    <Link 
      to={`/${type === 'expense' ? 'gastos' : 'ingresos'}/${item.id}`}
      className="flex w-full h-full flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-[#DA0081]/30"
    >
      {/* Fila superior: Nombre y Monto */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[#200020] text-lg leading-tight">{item.name}</h3>
      </div>
      
      {/* Contenedor de etiquetas (Tiempo + Grupos) */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <FrequencyBadge frequency={item.frequency} />
        
        {itemGroups.map((group) => (
          <span 
            key={group.id} 
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700"
          >
            <i className={`${group.iconKey} text-sm`} />
            {group.name}
          </span>
        ))}
      </div>

      {/* Fila inferior: Último registro */}
      <div className="mt-2 border-t border-gray-50 pt-3 text-xs text-gray-500 flex justify-between items-center">
        <span>Último registro: <span className="font-bold text-[#200020] whitespace-nowrap">${item.lastAmount || 0}</span></span>
      </div>
    </Link>
  );
}