import { useState } from "react";
import { formatCurrency } from "@/lib/expenses";

interface SpendingPowerProps {
  budget: number;
  totalAllExpenses: number;
  onSaveBudget: (value: number) => void;
}

const SpendingPower = ({ budget, totalAllExpenses, onSaveBudget }: SpendingPowerProps) => {
  const [inputValue, setInputValue] = useState(budget > 0 ? budget.toString() : "");
  const [error, setError] = useState("");
  const remaining = budget - totalAllExpenses;

  const handleSave = () => {
    const value = parseFloat(inputValue);
    if (Number.isNaN(value) || value < 0) {
      setError("Enter a valid monthly amount (0 or more).");
      return;
    }
    setError("");
    onSaveBudget(value);
  };

  return (
    <section id="spending-section" className="section-card" aria-label="Spending power">
      <h2 className="text-lg font-semibold mb-3">💪 Spending Power</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border border-border" style={{ background: 'var(--gradient-budget-card)' }}>
          <div className="mb-2">
            <p className="text-sm text-muted m-0 mb-1">Monthly spending power</p>
            <p className="text-[13px] text-muted/70 m-0">Enter your monthly salary to see what's left.</p>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2 my-2">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 50000"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="form-input"
            />
            <button onClick={handleSave} className="btn-primary-pill text-sm px-3 py-2">Save</button>
          </div>
          {error && <p className="text-destructive text-sm mt-1">{error}</p>}
          <p className="text-sm text-muted/70 m-0">Monthly Budget</p>
          <p className="text-2xl font-bold text-primary-foreground m-0">{formatCurrency(budget)}</p>
        </div>

        <div className="rounded-xl p-3 border border-border" style={{ background: 'var(--gradient-remaining-card)' }}>
          <p className="text-sm text-muted m-0 mb-1">Remaining after expenses (uses all expenses)</p>
          <p className={`text-2xl font-bold m-0 ${remaining >= 0 ? 'text-[#0f766e]' : 'text-[#b42318]'}`}>
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
