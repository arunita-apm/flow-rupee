import { formatCurrency } from "@/lib/expenses";

interface SpendingPowerProps {
  budget: number;
  totalAllExpenses: number;
}

const SpendingPower = ({ budget, totalAllExpenses }: SpendingPowerProps) => {
  const remaining = budget - totalAllExpenses;

  return (
    <section id="spending-section" className="section-card" aria-label="Spending power">
      <h2 className="text-lg font-semibold mb-3">Spending Power</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border border-border" style={{ background: 'var(--gradient-budget-card)' }}>
          <p className="text-sm text-muted m-0 mb-1">Monthly Salary</p>
          <p className="text-2xl font-bold text-primary-foreground m-0">{formatCurrency(budget)}</p>
        </div>

        <div className="rounded-xl p-3 border border-border" style={{ background: 'var(--gradient-remaining-card)' }}>
          <p className="text-sm text-muted m-0 mb-1">Remaining after expenses</p>
          <p className={`text-2xl font-bold m-0 ${remaining >= 0 ? 'text-[hsl(172,80%,24%)]' : 'text-destructive'}`}>
            {formatCurrency(remaining)}
          </p>
          <p className="text-sm text-muted mt-1 m-0">
            {formatCurrency(budget)} - {formatCurrency(totalAllExpenses)} = {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SpendingPower;
