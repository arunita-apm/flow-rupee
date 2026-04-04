import { useMemo, useCallback } from "react";
import { type Transaction, formatCurrency } from "@/lib/expenses";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, differenceInDays, format } from "date-fns";

interface SubscriptionBannerProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

const SubscriptionBanner = ({ transactions, onRefresh }: SubscriptionBannerProps) => {
  const dueSoon = useMemo(() => {
    const subs = transactions.filter(
      (t) => t.transaction_type === "Subscription/Autopay" && t.status === "active"
    );

    // Group by platform
    const map: Record<string, { platform: string; amount: number; lastDate: string; ids: string[] }> = {};
    subs.forEach((t) => {
      const key = t.platform || t.category;
      if (!map[key]) map[key] = { platform: key, amount: 0, lastDate: t.date, ids: [] };
      map[key].amount += t.amount;
      if (t.date > map[key].lastDate) map[key].lastDate = t.date;
      map[key].ids.push(t.id);
    });

    const today = new Date();
    return Object.values(map).filter((g) => {
      const expectedNext = addDays(new Date(g.lastDate), 30);
      const daysUntil = differenceInDays(expectedNext, today);
      return daysUntil >= 0 && daysUntil <= 3;
    }).map((g) => {
      const expectedNext = addDays(new Date(g.lastDate), 30);
      const daysUntil = differenceInDays(expectedNext, today);
      return { ...g, daysUntil };
    });
  }, [transactions]);

  const handleConfirm = useCallback(async (ids: string[]) => {
    await supabase.from("transactions").update({ last_confirmed_at: new Date().toISOString() }).in("id", ids);
    toast.success("Confirmed as active");
    onRefresh();
  }, [onRefresh]);

  const handleCancel = useCallback(async (ids: string[]) => {
    await supabase.from("transactions").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).in("id", ids);
    toast.success("Marked as cancelled");
    onRefresh();
  }, [onRefresh]);

  if (dueSoon.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {dueSoon.map((sub) => (
        <div
          key={sub.platform}
          className="section-card flex flex-col gap-2 border-l-4 border-l-amber-500"
          style={{ background: "linear-gradient(180deg, hsl(48 96% 95%) 0%, hsl(48 96% 89%) 100%)" }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm m-0">
              <span className="font-semibold">{sub.platform}</span>{" "}
              {formatCurrency(sub.amount)} is due in{" "}
              <span className="font-semibold">{sub.daysUntil} day{sub.daysUntil !== 1 ? "s" : ""}</span>
              {" "}— still using it?
            </p>
          </div>
          <div className="flex gap-2 ml-6">
            <button
              onClick={() => handleConfirm(sub.ids)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground cursor-pointer hover:bg-accent transition-colors"
            >
              <CheckCircle size={12} /> Still Active
            </button>
            <button
              onClick={() => handleCancel(sub.ids)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground border-none cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <XCircle size={12} /> Cancelled It
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionBanner;
