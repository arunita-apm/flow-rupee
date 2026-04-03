import { type Transaction, categories, formatCurrency, calculateTotalExpenses, calculateCategoryTotals } from "@/lib/expenses";

interface SummarySectionProps {
  filtered: Transaction[];
}

const SummarySection = ({ filtered }: SummarySectionProps) => {
  const total = calculateTotalExpenses(filtered);
  const categoryTotals = calculateCategoryTotals(filtered);

  return (
    <section id="summary-section" className="section-card" aria-label="Expense summary">
      <h2 className="text-lg font-semibold mb-3">Summary</h2>
      <div className="rounded-xl p-3 border border-border mb-3" style={{ background: 'var(--gradient-card)' }}>
        <p className="text-sm text-muted m-0 mb-1">Total Expenses (filtered)</p>
        <p className="text-2xl font-bold text-primary-foreground m-0">{formatCurrency(total)}</p>
      </div>
      <div className="rounded-xl p-3 border border-border" style={{ background: 'var(--gradient-card)' }}>
        <p className="text-sm text-muted m-0 mb-2">Category Totals</p>
        <ul className="list-none p-0 m-0">
          {filtered.length === 0 ? (
            <li className="py-1.5 text-sm text-muted">No expenses yet.</li>
          ) : (
            categories.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              if (amount === 0) return null;
              return (
                <li key={cat} className="py-1.5 border-b border-border/50 last:border-b-0 text-sm">
                  {cat}: {formatCurrency(amount)}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
};

export default SummarySection;
