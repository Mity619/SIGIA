import type { Timestamp } from 'firebase/firestore';

export type TransactionType = 'expense' | 'income';
export type Frequency = 'eventual' | 'daily' | 'weekly' | 'monthly' | 'annual';

// Concepto: "Café", "Alquiler"
export interface ItemDoc {
  id?: string;
  name: string;
  type: TransactionType;
  frequency: Frequency;
  groupIds: string[];
  lastAmount: number;            // denormalizado para HU-05 (<500 ms)
  lastUsedAt?: Timestamp | null;
  archived: boolean;             // soft delete — HU-06
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Movimiento: cada vez que se registra
export interface EntryDoc {
  id?: string;
  itemId: string;
  accountId: string;
  name: string;
  amount: number;
  date: Timestamp;             // default: serverTimestamp
  groupIds?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}