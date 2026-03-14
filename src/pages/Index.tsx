import { useState, useCallback, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import PillNav from "@/components/PillNav";
import SpendingPower from "@/components/SpendingPower";
import AddExpenseForm from "@/components/AddExpenseForm";
import FiltersSection from "@/components/FiltersSection";
import ExpenseList from "@/components/ExpenseList";
import SummarySection from "@/components/SummarySection";
import {
  type Expense,
  type Category,
  type Filters,
  loadExpenses,
  saveExpenses,
  loadBudget,
  saveBudget,
  sortExpensesByDate,
  filterExpenses,
  calculateTotalExpenses,
} from "@/lib/expenses";

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => sortExpensesByDate(loadExpenses()));
  const [budget, setBudget] = useState(() => loadBudget());
  const [filters, setFilters] = useState<Filters>({ category: "", startDate: "", endDate: "" });

  const filtered = filterExpenses(expenses, filters);
  const totalAll = calculateTotalExpenses(expenses);

  const handleNavigate = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSaveBudget = useCallback((value: number) => {
    setBudget(value);
    saveBudget(value);
  }, []);

  const handleAddExpense = useCallback((data: { amount: string; category: Category; date: string; notes: string }) => {
    const parsedAmount = parseFloat(data.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return { error: "Please enter a valid amount greater than 0." };
    if (!data.date) return { error: "Please pick a date." };
    if (!data.category) return { error: "Please select a category." };

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      amount: parsedAmount,
      category: data.category,
      date: data.date,
      notes: data.notes?.trim() || "",
    };
    const updated = sortExpensesByDate([...expenses, newExpense]);
    setExpenses(updated);
    saveExpenses(updated);
    return { error: null };
  }, [expenses]);

  const handleDelete = useCallback((id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  }, [expenses]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="max-w-[960px] mx-auto px-4 pb-10">
        <PillNav onNavigate={handleNavigate} />
        <div className="flex flex-col gap-4 mt-4">
          <SpendingPower budget={budget} totalAllExpenses={totalAll} onSaveBudget={handleSaveBudget} />
          <AddExpenseForm onAdd={handleAddExpense} />
          <FiltersSection filters={filters} onChange={setFilters} />
          <ExpenseList expenses={filtered} onDelete={handleDelete} />
          <SummarySection filtered={filtered} />
        </div>
      </main>
    </div>
  );
};

export default Index;
