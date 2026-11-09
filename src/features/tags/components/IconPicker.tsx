import { ICONS_BY_TONE } from '../constants/icons';
import type { IconTone } from '../types/tags.types';

interface Props {
  tone: IconTone;
  value: string;
  onChange: (key: string) => void;
}

export function IconPicker({ tone, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {ICONS_BY_TONE[tone].map((icon) => (
        <button
          key={icon.key}
          type="button"
          onClick={() => onChange(icon.key)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
            value === icon.key
              ? 'border-[#DA0081] bg-[#DA0081]/10'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
          title={icon.label}
        >
          <i className={`${icon.key} text-lg`} />
        </button>
      ))}
    </div>
  );
}