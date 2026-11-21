
import type { DomainItem } from "./types";
import { sumAmounts } from "./money";

export interface ChecklistResult {
  completed: DomainItem[];
  saved: DomainItem[];
  totalSpent: number;
  totalSaved: number;
}

export function calculateChecklist(
  items: DomainItem[],
  checkedIds: string[],
): ChecklistResult {
  const checked = new Set(checkedIds);

  
  const expenses = items.filter(
    (item) =>
      item.type === "expense" &&
      item.frequency !== "eventual",
  );

  const completed = expenses.filter((item) =>
    checked.has(item.id),
  );

  const saved = expenses.filter(
    (item) => !checked.has(item.id),
  );

  return {
    completed,
    saved,
    totalSpent: sumAmounts(
      completed.map((item) => item.lastAmount),
    ),
    totalSaved: sumAmounts(
      saved.map((item) => item.lastAmount),
    ),
  };
}
