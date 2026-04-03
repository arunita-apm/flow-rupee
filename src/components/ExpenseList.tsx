import { type Transaction, formatCurrency } from "@/lib/expenses";
import { Trash2 } from "lucide-react";

interface ExpenseListProps {
  expenses: Transaction[];
  onDelete: (id: string) => void;
}

const ExpenseList = ({ expenses, onDelete }: ExpenseListProps) => (
  <section id="expenses-section" className="section-card" aria-label="Expense list">
    <h2 className="text-lg font-semibold mb-3">Expenses</h2>
    <div className="flex flex-col gap-2.5">
      {expenses.length === 0 ? (
        <div className="text-center text-muted p-4 border border-dashed border-muted/30 rounded-lg bg-accent/20">
          No expenses to show. Add one using the form above.
        </div>
      ) : (
        expenses.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_auto] max-sm:grid-cols-1 gap-2 rounded-lg p-3 border border-border transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/20"
            style={{ background: 'var(--gradient-expense-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex flex-col gap-1">
              <p className="font-bold m-0">{item.category} — {formatCurrency(item.amount)}</p>
              <p className="text-sm text-muted m-0">{item.date}</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {item.platform && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">{item.platform}</span>
                )}
                {item.payment_method && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">{item.payment_method}</span>
                )}
                {item.transaction_type && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">{item.transaction_type}</span>
                )}
                {item.need_or_want && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    item.need_or_want === "Need" ? "bg-success/20 text-success-foreground border-success/30" :
                    item.need_or_want === "Want" ? "bg-accent/40 text-accent-foreground border-accent/50" :
                    "bg-destructive/20 text-destructive-foreground border-destructive/30"
                  }`}>{item.need_or_want}</span>
                )}
              </div>
              {item.notes && <p className="text-[13px] text-foreground/70 m-0 mt-1">Notes: {item.notes}</p>}
            </div>
            <div className="flex items-start">
              <button
                onClick={() => onDelete(item.id)}
                className="px-3 py-2 text-sm rounded-full bg-destructive text-destructive-foreground cursor-pointer transition-all duration-150 hover:brightness-90 hover:-translate-y-px flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);

export default ExpenseList;
