import type { Timestamp } from "firebase/firestore";

export interface SavingsGoalDoc {
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Timestamp;
  createdAt: Timestamp;
}

export interface CreateSavingsGoalInput {
  name: string;
  targetAmount: number;
  deadline: Date;
}
