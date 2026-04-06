import { useState, useCallback, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/components/Dashboard";
import SilentSpends from "@/components/SilentSpends";
import InsightsSection from "@/components/InsightsSection";
import AddExpenseForm from "@/components/AddExpenseForm";
import FiltersSection from "@/components/FiltersSection";
import ExpenseList from "@/components/ExpenseList";
import SummarySection from "@/components/SummarySection";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  type Transaction,
  type Filters,
  filterTransactions,
} from "@/lib/expenses";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const Index = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>({ category: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  const budget = profile?.monthly_budget ?? 0;

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    setTransactions((data as Transaction[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = filterTransactions(transactions, filters);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === "add") {
      setAddDrawerOpen(true);
    } else {
      setActiveTab(tab);
    }
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
    setAddDrawerOpen(false);
    return { error: null };
  }, [user, fetchTransactions]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center text-muted py-8">Loading...</div>;
    }

    switch (activeTab) {
      case "home":
        return (
          <div className="flex flex-col gap-3">
            <SubscriptionBanner transactions={transactions} onRefresh={fetchTransactions} />
            <Dashboard transactions={transactions} budget={budget} />
          </div>
        );
      case "silent":
        return <SilentSpends transactions={transactions} onRefresh={fetchTransactions} />;
      case "insights":
        return <InsightsSection transactions={transactions} />;
      case "expenses":
        return (
          <div className="flex flex-col gap-4">
            <FiltersSection filters={filters} onChange={setFilters} />
            <ExpenseList expenses={filtered} onDelete={handleDelete} />
            <SummarySection filtered={filtered} />
          </div>
        );
      default:
        return <Dashboard transactions={transactions} budget={budget} />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <AppHeader showSubtitle={activeTab === "home"} />

      <main className="max-w-[960px] mx-auto px-4 pb-4">
        {activeTab === "home" && profile?.name && (
          <div className="section-card mt-4 text-center">
            <p className="text-lg font-semibold m-0">Hey {profile.name}, let's track your money</p>
          </div>
        )}
        <div className="mt-4">
          {renderContent()}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <Drawer open={addDrawerOpen} onOpenChange={setAddDrawerOpen}>
        <DrawerContent className="max-h-[90vh] sm:max-h-[85vh] flex flex-col">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>Add Expense</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <AddExpenseForm onAdd={handleAddExpense} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Index;
