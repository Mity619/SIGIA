
import type { Timestamp } from "firebase/firestore";
import type { ChecklistFrequency } from "@/domain/period";

// Información histórica de cada gasto de la checklist.
export interface ChecklistItemRecord {
  itemId: string;
  name: string;
  amount: number;
}

// Una checklist guardada en Firestore.
export interface ChecklistPeriodDoc {
  frequency: ChecklistFrequency;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  completed: ChecklistItemRecord[];
  saved: ChecklistItemRecord[];
  totalSpent: number;
  totalSaved: number;
  accountId: string;
  createdAt: Timestamp;
}
