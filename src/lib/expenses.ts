import {
  Utensils, Plane, ShoppingBag, Home, Lightbulb, Film,
  Dumbbell, GraduationCap, Sparkles, Gift, MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const categories = [
  "Food & Dining", "Travel & Transport", "Shopping",
  "Rent & Housing", "Utilities & Bills", "Entertainment",
  "Health & Fitness", "Education", "Personal Care",
  "Gifts & Social", "Miscellaneous",
] as const;
export type Category = (typeof categories)[number];

export const categoryIcons: Record<Category, LucideIcon> = {
  "Food & Dining": Utensils,
  "Travel & Transport": Plane,
  "Shopping": ShoppingBag,
  "Rent & Housing": Home,
  "Utilities & Bills": Lightbulb,
  "Entertainment": Film,
  "Health & Fitness": Dumbbell,
  "Education": GraduationCap,
  "Personal Care": Sparkles,
  "Gifts & Social": Gift,
  "Miscellaneous": MoreHorizontal,
};

export const platforms = [
  "Swiggy", "Zomato", "Blinkit", "Amazon", "Flipkart",
  "Myntra", "Ajio", "Uber", "Ola", "Netflix", "Spotify",
  "Hotstar", "Zepto", "BigBasket", "PharmEasy", "BookMyShow", "Other",
] as const;
export type Platform = (typeof platforms)[number];

export const paymentMethods = ["UPI", "Credit Card", "Debit Card", "Cash", "EMI", "BNPL"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const transactionTypes = ["One-time", "Subscription/Autopay", "EMI", "Refund"] as const;
export type TransactionType = (typeof transactionTypes)[number];

export const needOrWantOptions = ["Need", "Want", "Impulse"] as const;
export type NeedOrWant = (typeof needOrWantOptions)[number];

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  platform: string | null;
  payment_method: string | null;
  transaction_type: string | null;
  need_or_want: string | null;
  date: string;
  notes: string | null;
  created_at: string;
  status: string;
  cancelled_at: string | null;
  last_confirmed_at: string | null;
}

export interface Filters {
  category: string;
  startDate: string;
  endDate: string;
}

export function filterTransactions(list: Transaction[], filters: Filters): Transaction[] {
  return list.filter((item) => {
    const matchesCategory = filters.category ? item.category === filters.category : true;
    const matchesStart = filters.startDate ? item.date >= filters.startDate : true;
    const matchesEnd = filters.endDate ? item.date <= filters.endDate : true;
    return matchesCategory && matchesStart && matchesEnd;
  });
}

export function calculateTotalExpenses(list: Transaction[]): number {
  return list.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateCategoryTotals(list: Transaction[]): Record<string, number> {
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
