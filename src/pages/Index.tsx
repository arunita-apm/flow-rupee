import { useState, useCallback, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import PillNav from "@/components/PillNav";
import SpendingPower from "@/components/SpendingPower";
import AddExpenseForm from "@/components/AddExpenseForm";
import FiltersSection from "@/components/FiltersSection";
import ExpenseList from "@/components/ExpenseList";
import SummarySection from "@/components/SummarySection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  type Transaction,
  type Filters,
  filterTransactions,
  calculateTotalExpenses,
} from "@/lib/expenses";

const Index = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>({ category: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);

  const budget = profile?.monthly_salary ?? 0;

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = filterTransactions(transactions, filters);
  const totalAll = calculateTotalExpenses(transactions);

  const handleNavigate = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleAddExpense = useCallback(async (data: {
    amount: string; category: string; platform: string;
    payment_method: string; transaction_type: string;
    need_or_want: string; date: string; notes: string;
  }) => {
    const parsedAmount = parseFloat(data.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return { error: "Please enter a valid amount greater than 0." };
    if (!data.date) return { error: "Please pick a date." };
    if (!user) return { error: "Not logged in." };

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      amount: parsedAmount,
      category: data.category,
      platform: data.platform,
      payment_method: data.payment_method,
      transaction_type: data.transaction_type,
      need_or_want: data.need_or_want,
      date: data.date,
      notes: data.notes?.trim() || "",
    });

    if (error) return { error: error.message };
    await fetchTransactions();
    return { error: null };
  }, [user, fetchTransactions]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="max-w-[960px] mx-auto px-4 pb-10">
        {profile?.name && (
          <div className="section-card mt-4 text-center">
            <p className="text-lg font-semibold m-0">Hey {profile.name}, let's track your money 👋</p>
          </div>
        )}
        <PillNav onNavigate={handleNavigate} />
        <div className="flex flex-col gap-4 mt-4">
          <SpendingPower budget={budget} totalAllExpenses={totalAll} />
          <AddExpenseForm onAdd={handleAddExpense} />
          <FiltersSection filters={filters} onChange={setFilters} />
          {loading ? (
            <div className="text-center text-muted py-8">Loading expenses...</div>
          ) : (
            <ExpenseList expenses={filtered} onDelete={handleDelete} />
          )}
          <SummarySection filtered={filtered} />
        </div>
      </main>
    </div>
  );
};

export default Index;
