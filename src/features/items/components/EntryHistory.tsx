import type { EntryDoc } from "../types/items.types";

interface Props {
  entries: EntryDoc[];
  onDeleteClick: (entryId: string) => void;
  onEditClick: (entry: EntryDoc) => void;
}

export function EntryHistory({ entries, onDeleteClick, onEditClick }: Props) {
  if (entries.length === 0) return <p className="text-gray-500">No hay movimientos registrados.</p>;

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
          <div>
            <p className="font-medium text-[#200020]">{entry.name}</p>
            <p className="text-sm text-gray-500">
              {new Intl.DateTimeFormat("es", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
                .format(entry.date.toDate())
                .replace(/ de /, " de ")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#200020]">${entry.amount}</span>
            <button onClick={() => onEditClick(entry)} className="text-blue-500 hover:text-blue-700">
              <i className="ri-edit-line text-lg" />
            </button>
            <button onClick={() => onDeleteClick(entry.id!)} className="text-red-500 hover:text-red-700">
              <i className="ri-delete-bin-line text-lg" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}