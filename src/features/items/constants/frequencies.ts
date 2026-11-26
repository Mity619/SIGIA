import type { Frequency } from '../types/items.types';

export const FREQUENCIES: Record<Frequency, {
  label: string;
  icon: string;                  // clase Remix Icon
  factor: number;                // para proyección anual (fórmula §5.1)
}> = {
  eventual: { label: 'Eventual', icon: 'ri-gift-line',            factor: 0  },
  daily:    { label: 'Diario',   icon: 'ri-sun-line',             factor: 365 },
  weekly:   { label: 'Semanal',  icon: 'ri-calendar-2-line',      factor: 52 },
  monthly:  { label: 'Mensual',  icon: 'ri-calendar-line',        factor: 12 },
  annual:   { label: 'Anual',    icon: 'ri-calendar-check-line',  factor: 1  },
};

export const FREQUENCY_OPTIONS = (
  Object.entries(FREQUENCIES) as [Frequency, (typeof FREQUENCIES)[Frequency]][]
).map(([value, cfg]) => ({ value, ...cfg }));