import { useMemo, useCallback } from "react";
import { type Transaction, formatCurrency } from "@/lib/expenses";
import { BellOff, CheckCircle, XCircle, CalendarClock, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, formatDistanceToNow } from "date-fns";

interface SilentSpendsProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

interface GroupedSub {
  platform: string;
  category: string;
  total: number;
  count: number;
  lastDate: string;
  expectedNext: string;
  transactionIds: string[];
}

const SilentSpends = ({ transactions, onRefresh }: SilentSpendsProps) => {
  const activeSubs = useMemo(() => {
    const subs = transactions.filter(
      (t) => t.transaction_type === "Subscription/Autopay" && t.status === "active"
    );
    const map: Record<string, GroupedSub> = {};
    subs.forEach((t) => {
      const key = t.platform || t.category;
      if (!map[key]) {
        map[key] = {
          platform: key,
          category: t.category,
          total: 0,
          count: 0,
          lastDate: t.date,
          expectedNext: "",
          transactionIds: [],
        };
      }
      map[key].total += t.amount;
      map[key].count += 1;
      if (t.date > map[key].lastDate) map[key].lastDate = t.date;
      map[key].transactionIds.push(t.id);
    });
    return Object.values(map)
      .map((g) => ({ ...g, expectedNext: format(addDays(new Date(g.lastDate), 30), "dd MMM yyyy") }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const cancelledSubs = useMemo(() => {
    const subs = transactions.filter(
      (t) => t.transaction_type === "Subscription/Autopay" && t.status === "cancelled"
    );
    const map: Record<string, { platform: string; total: number; cancelledAt: string }> = {};
    subs.forEach((t) => {
      const key = t.platform || t.category;
      if (!map[key]) {
        map[key] = { platform: key, total: 0, cancelledAt: t.cancelled_at || t.date };
      }
      map[key].total += t.amount;
      if (t.cancelled_at && t.cancelled_at > map[key].cancelledAt) {
        map[key].cancelledAt = t.cancelled_at;
      }
    });
    return Object.values(map).sort((a, b) => b.cancelledAt.localeCompare(a.cancelledAt));
  }, [transactions]);

  const totalMonthly = activeSubs.reduce((s, g) => s + g.total, 0);

  const handleStillActive = useCallback(async (item: GroupedSub) => {
    const { error } = await supabase
      .from("transactions")
      .update({ last_confirmed_at: new Date().toISOString() })
      .in("id", item.transactionIds);
    if (error) { toast.error("Failed to confirm"); return; }
    toast.success(`${item.platform} confirmed as active`);
    onRefresh();
  }, [onRefresh]);

  const handleCancelled = useCallback(async (item: GroupedSub) => {
    const { error } = await supabase
      .from("transactions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .in("id", item.transactionIds);
    if (error) { toast.error("Failed to cancel"); return; }
    toast.success(`${item.platform} marked as cancelled`);
    onRefresh();
  }, [onRefresh]);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="section-card text-center"
        style={{ background: "linear-gradient(180deg, hsl(48 96% 95%) 0%, hsl(48 96% 89%) 100%)" }}
      >
        <p className="text-sm text-muted m-0 mb-1">Total Silent Spends</p>
        <p className="text-3xl font-bold m-0 text-amber-800">
          {formatCurrency(totalMonthly)}
        </p>
        <p className="text-sm text-muted mt-1 m-0">
          {activeSubs.length} subscription{activeSubs.length !== 1 ? "s" : ""} draining your wallet
        </p>
      </div>

      {activeSubs.length === 0 ? (
        <div className="section-card text-center">
          <p className="text-muted m-0">No active subscriptions found. You're clean!</p>
        </div>
      ) : (
        activeSubs.map((item) => (
          <div
            key={item.platform}
            className="section-card flex flex-col gap-3"
            style={{ background: "linear-gradient(180deg, hsl(50 100% 97%) 0%, hsl(50 92% 91%) 100%)" }}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold m-0">{item.platform}</p>
                <p className="text-xs text-muted-foreground m-0">{item.category}</p>
                <p className="text-sm font-bold m-0 mt-1">{formatCurrency(item.total)}</p>
              </div>
              <BellOff size={18} className="text-amber-600 shrink-0 mt-1" />
            </div>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <RotateCcw size={12} /> Recorded {item.count} time{item.count !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock size={12} /> Last added: {format(new Date(item.lastDate), "dd MMM yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock size={12} /> Expected next: {item.expectedNext}
              </span>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => handleStillActive(item)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground cursor-pointer hover:bg-accent transition-colors"
              >
                <CheckCircle size={14} /> Still Active
              </button>
              <button
                onClick={() => handleCancelled(item)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-primary text-primary-foreground border-none cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <XCircle size={14} /> Cancelled It
              </button>
            </div>
          </div>
        ))
      )}

      {/* Cancelled subscriptions section */}
      {cancelledSubs.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Cancelled Subscriptions</h3>
          {cancelledSubs.map((item) => (
            <div
              key={item.platform}
              className="section-card flex items-center justify-between mb-2 opacity-60"
            >
              <div className="flex flex-col gap-0.5">
                <p className="font-medium m-0 text-sm line-through">{item.platform}</p>
                <p className="text-xs text-muted-foreground m-0">
                  {formatCurrency(item.total)} saved
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                Cancelled {formatDistanceToNow(new Date(item.cancelledAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SilentSpends;
