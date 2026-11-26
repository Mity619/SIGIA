// Tipos de dominio: sin dependencias de Firebase ni React.

export type TransactionType = "expense" | "income";
export type Frequency = "eventual" | "daily" | "weekly" | "monthly" | "annual";

export interface DomainItem {
  id: string;
  name: string;
  type: TransactionType;
  frequency: Frequency;
  groupIds: string[];
  lastAmount: number;
}

export interface DomainEntry {
  id: string;
  itemId: string;
  /** Puede faltar en movimientos creados antes de que se guardara el tipo. */
  type?: TransactionType;
  amount: number;
  date: Date;
}
