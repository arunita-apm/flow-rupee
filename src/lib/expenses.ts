const STORAGE_KEY = "expenses";
const BUDGET_KEY = "monthlyBudget";

export const categories = ["Food", "Travel", "Rent", "Shopping", "Utilities", "Miscellaneous"] as const;
export type Category = (typeof categories)[number];

export const categoryIcons: Record<Category, string> = {
  Food: "🍽️",
  Travel: "✈️",
  Rent: "🏠",
  Shopping: "🛍️",
  Utilities: "💡",
  Miscellaneous: "✨",
};

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  notes: string;
}

export interface Filters {
  category: string;
  startDate: string;
  endDate: string;
}

export function loadExpenses(): Expense[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((e: Expense) => (e.category === ("Others" as string) ? { ...e, category: "Miscellaneous" as Category } : e))
      : [];
  } catch {
    return [];
  }
}

export function saveExpenses(items: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function loadBudget(): number {
  const stored = localStorage.getItem(BUDGET_KEY);
  const value = parseFloat(stored || "0");
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function saveBudget(value: number) {
  localStorage.setItem(BUDGET_KEY, value.toString());
}

export function sortExpensesByDate(list: Expense[]): Expense[] {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function filterExpenses(list: Expense[], filters: Filters): Expense[] {
  return list.filter((item) => {
    const matchesCategory = filters.category ? item.category === filters.category : true;
    const matchesStart = filters.startDate ? item.date >= filters.startDate : true;
    const matchesEnd = filters.endDate ? item.date <= filters.endDate : true;
    return matchesCategory && matchesStart && matchesEnd;
  });
}

export function calculateTotalExpenses(list: Expense[]): number {
  return list.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateCategoryTotals(list: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  list.forEach((item) => {
    totals[item.category] = (totals[item.category] || 0) + item.amount;
  });
  return totals;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
