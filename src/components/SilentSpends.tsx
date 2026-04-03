import { useMemo } from "react";
import { type Transaction, formatCurrency } from "@/lib/expenses";

interface SilentSpendsProps {
  transactions: Transaction[];
}

const SilentSpends = ({ transactions }: SilentSpendsProps) => {
  const silentTxns = useMemo(() => {
    return transactions.filter((t) => t.transaction_type === "Subscription/Autopay");
  }, [transactions]);

  const grouped = useMemo(() => {
    const map: Record<string, { total: number; count: number; platform: string }> = {};
    silentTxns.forEach((t) => {
      const key = t.platform || t.category;
      if (!map[key]) map[key] = { total: 0, count: 0, platform: key };
      map[key].total += t.amount;
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [silentTxns]);

  const totalMonthly = silentTxns.reduce((s, t) => s + t.amount, 0);

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
          {grouped.length} subscription{grouped.length !== 1 ? "s" : ""} draining your wallet
        </p>
      </div>

      {grouped.length === 0 ? (
        <div className="section-card text-center">
          <p className="text-muted m-0">No subscriptions found. You're clean!</p>
        </div>
      ) : (
        grouped.map((item) => (
          <div
            key={item.platform}
            className="section-card flex items-center justify-between"
            style={{ background: "linear-gradient(180deg, hsl(50 100% 97%) 0%, hsl(50 92% 91%) 100%)" }}
          >
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold m-0">{item.platform}</p>
              <p className="text-sm text-muted m-0">
                {formatCurrency(item.total)} · {item.count} transaction{item.count !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-700 mt-1 m-0 italic">Still using this?</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors">
                Yes
              </button>
              <button className="px-3 py-1.5 text-xs rounded-full bg-amber-50 text-amber-800 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors">
                Not Sure
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SilentSpends;
