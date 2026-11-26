import { FREQUENCIES } from '../constants/frequencies';
import type { Frequency } from '../types/items.types';

export function FrequencyBadge({ frequency }: { frequency: Frequency }) {
  const cfg = FREQUENCIES[frequency];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
      <i className={cfg.icon} />
      {cfg.label}
    </span>
  );
}