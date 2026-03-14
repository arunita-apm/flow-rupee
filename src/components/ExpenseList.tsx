import { type Expense, categoryIcons, formatCurrency, type Category } from "@/lib/expenses";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList = ({ expenses, onDelete }: ExpenseListProps) => (
  <section id="expenses-section" className="section-card" aria-label="Expense list">
    <h2 className="text-lg font-semibold mb-3">🧾 Expenses</h2>
    <div className="flex flex-col gap-2.5">
      {expenses.length === 0 ? (
        <div className="text-center text-muted p-4 border border-dashed border-muted/30 rounded-lg bg-accent/20">
          No expenses to show. Add one using the form above.
        </div>
      ) : (
        expenses.map((item) => {
          const icon = categoryIcons[item.category as Category] || "💸";
          return (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_auto] max-sm:grid-cols-1 gap-2 rounded-lg p-3 border border-border transition-all duration-150 hover:-translate-y-0.5 hover:border-[#d4ddff]"
              style={{ background: 'var(--gradient-expense-card)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex flex-col gap-1">
                <p className="font-bold m-0">{icon} {item.category} — {formatCurrency(item.amount)}</p>
                <p className="text-sm text-muted m-0">📅 Date: {item.date}</p>
                {item.notes && <p className="text-[13px] text-foreground/70 m-0">Notes: {item.notes}</p>}
              </div>
              <div className="flex items-start">
                <button
                  onClick={() => onDelete(item.id)}
                  className="px-3 py-2 text-sm rounded-full bg-destructive text-destructive-foreground cursor-pointer transition-all duration-150 hover:brightness-90 hover:-translate-y-px"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  </section>
);

export default ExpenseList;
