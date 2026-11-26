import type { Timestamp } from 'firebase/firestore';

export type IconTone = 'green' | 'neutral' | 'red';

export interface GroupDoc {
  id?: string;
  name: string;
  iconKey: string;               // obligatorio — HU-09
  tone: IconTone;
  createdAt?: Timestamp;
}