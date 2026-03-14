import { useState } from "react";
import { categories, type Category } from "@/lib/expenses";

interface AddExpenseFormProps {
  onAdd: (data: { amount: string; category: Category; date: string; notes: string }) => { error: string | null };
}

const AddExpenseForm = ({ onAdd }: AddExpenseFormProps) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setError("Please select a category.");
      return;
    }
    const result = onAdd({ amount, category, date, notes });
    if (result.error) {
      setError(result.error);
      return;
    }
    setError("");
    setAmount("");
    setCategory("");
    setDate("");
    setNotes("");
  };

  return (
    <section id="add-expense-section" className="section-card" aria-label="Add expense">
      <h2 className="text-lg font-semibold mb-3">➕ Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            Amount (required)
            <input type="number" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Category
            <select required value={category} onChange={(e) => setCategory(e.target.value as Category)} className="form-input">
              <option value="">Select</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Date (required)
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Notes (optional)
            <input type="text" maxLength={120} placeholder="e.g. Lunch with friends" value={notes} onChange={(e) => setNotes(e.target.value)} className="form-input" />
          </label>
        </div>
        <div className="flex justify-end mt-3">
          <button type="submit" className="btn-primary-pill">➕ Add Expense</button>
        </div>
      </form>
      {error && <p className="text-destructive text-sm mt-1.5" role="alert">{error}</p>}
    </section>
  );
};

export default AddExpenseForm;
