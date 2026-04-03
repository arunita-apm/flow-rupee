import { useMemo } from "react";
import { type Transaction, formatCurrency, type Category } from "@/lib/expenses";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface DashboardProps {
  transactions: Transaction[];
  budget: number;
}

const Dashboard = ({ transactions, budget }: DashboardProps) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const stats = useMemo(() => {
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSpent = thisMonth.reduce((s, t) => s + t.amount, 0);
    const remaining = budget - totalSpent;
    const percentUsed = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

    const catTotals: Record<string, number> = {};
    thisMonth.forEach((t) => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

    const silentSpends = thisMonth.filter((t) => t.transaction_type === "Subscription/Autopay");
    const silentTotal = silentSpends.reduce((s, t) => s + t.amount, 0);

    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const thisWeekSpent = thisMonth
      .filter((t) => new Date(t.date) >= startOfThisWeek)
      .reduce((s, t) => s + t.amount, 0);
    const lastWeekSpent = thisMonth
      .filter((t) => {
        const d = new Date(t.date);
        return d >= startOfLastWeek && d < startOfThisWeek;
      })
      .reduce((s, t) => s + t.amount, 0);

    const weekDiff = lastWeekSpent > 0
      ? ((thisWeekSpent - lastWeekSpent) / lastWeekSpent) * 100
      : thisWeekSpent > 0 ? 100 : 0;

    const biggest = thisMonth.length > 0
      ? thisMonth.reduce((max, t) => (t.amount > max.amount ? t : max), thisMonth[0])
      : null;

    return { totalSpent, remaining, percentUsed, topCategory, silentTotal, silentCount: silentSpends.length, thisWeekSpent, lastWeekSpent, weekDiff, biggest };
  }, [transactions, budget, currentMonth, currentYear]);

  const budgetIcon = stats.percentUsed >= 90
    ? <AlertTriangle size={16} className="inline mr-1 text-destructive" />
    : stats.percentUsed >= 80
    ? <Info size={16} className="inline mr-1 text-amber-600" />
    : <CheckCircle size={16} className="inline mr-1 text-emerald-600" />;

  const budgetMessage = stats.percentUsed >= 90
    ? "Almost out of budget!"
    : stats.percentUsed >= 80
    ? "Careful, 80%+ budget used"
    : stats.percentUsed >= 50
    ? "You're doing okay"
    : "Great spending control!";

  return (
    <div className="flex flex-col gap-3">
      {/* Budget vs Spent */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold m-0">Monthly Budget vs Spent</h3>
          <span className="text-xs text-muted">{Math.round(stats.percentUsed)}% used</span>
        </div>
        <Progress value={stats.percentUsed} className="h-3 mb-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted">Spent: {formatCurrency(stats.totalSpent)}</span>
          <span className="text-muted">Budget: {formatCurrency(budget)}</span>
        </div>
        <p className="text-sm mt-2 m-0 font-medium">{budgetIcon}{budgetMessage}</p>
      </div>

      {/* Remaining Balance */}
      <div className="section-card text-center">
        <p className="text-sm text-muted m-0 mb-1">Remaining Balance</p>
        <p className={`text-3xl font-bold m-0 ${stats.remaining >= 0 ? "text-[hsl(172,80%,24%)]" : "text-destructive"}`}>
          {formatCurrency(stats.remaining)}
        </p>
        <p className="text-xs text-muted mt-1 m-0">
          {stats.remaining >= 0 ? "You've got this!" : "You've overspent this month"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Top Category */}
        <div className="section-card">
          <p className="text-sm text-muted m-0 mb-1">Top Spending Category</p>
          {stats.topCategory ? (
            <>
              <p className="text-xl font-bold m-0">{stats.topCategory[0]}</p>
              <p className="text-sm text-muted m-0 mt-1">{formatCurrency(stats.topCategory[1])}</p>
            </>
          ) : (
            <p className="text-sm text-muted m-0">No expenses yet this month</p>
          )}
        </div>

        {/* Silent Spends */}
        <div className="section-card" style={{ background: "linear-gradient(180deg, hsl(48 96% 95%) 0%, hsl(48 96% 89%) 100%)" }}>
          <p className="text-sm text-muted m-0 mb-1">Silent Spends</p>
          <p className="text-xl font-bold m-0">
            {formatCurrency(stats.silentTotal)} leaving silently
          </p>
          <p className="text-xs text-muted mt-1 m-0">
            {stats.silentCount} subscription{stats.silentCount !== 1 ? "s" : ""} every month
          </p>
        </div>

        {/* Week comparison */}
        <div className="section-card">
          <p className="text-sm text-muted m-0 mb-1">Week-on-Week</p>
          <p className="text-lg font-bold m-0 flex items-center gap-1">
            {stats.thisWeekSpent > stats.lastWeekSpent ? <TrendingUp size={18} className="text-destructive" /> : stats.thisWeekSpent < stats.lastWeekSpent ? <TrendingDown size={18} className="text-emerald-600" /> : <Minus size={18} />}
            {stats.weekDiff > 0 ? "+" : ""}{Math.round(stats.weekDiff)}%
          </p>
          <p className="text-xs text-muted mt-1 m-0">
            This week: {formatCurrency(stats.thisWeekSpent)} vs Last: {formatCurrency(stats.lastWeekSpent)}
          </p>
        </div>

        {/* Biggest Spend */}
        <div className="section-card">
          <p className="text-sm text-muted m-0 mb-1">Biggest Spend This Month</p>
          {stats.biggest ? (
            <>
              <p className="text-lg font-bold m-0">
                {formatCurrency(stats.biggest.amount)}
              </p>
              <p className="text-xs text-muted mt-1 m-0">
                {stats.biggest.category} · {stats.biggest.date}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted m-0">Nothing yet!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
