import { useState } from "react";
import {
  categories, platforms, paymentMethods, transactionTypes, needOrWantOptions,
  type Category, type Platform, type PaymentMethod, type TransactionType, type NeedOrWant,
} from "@/lib/expenses";

interface AddExpenseFormProps {
  onAdd: (data: {
    amount: string;
    category: Category;
    platform: Platform;
    payment_method: PaymentMethod;
    transaction_type: TransactionType;
    need_or_want: NeedOrWant;
    date: string;
    notes: string;
  }) => Promise<{ error: string | null }>;
}

function PillToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
  <div className="flex flex-col gap-1.5 text-sm">
    <span>{label}</span>
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 cursor-pointer ${
            value === opt
              ? "bg-primary text-primary-foreground border-primary-strong shadow-sm"
              : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
  );
}

const AddExpenseForm = ({ onAdd }: AddExpenseFormProps) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [transactionType, setTransactionType] = useState<TransactionType | "">("");
  const [needOrWant, setNeedOrWant] = useState<NeedOrWant | "">("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) { setError("Please select a category."); return; }
    if (!platform) { setError("Please select a platform."); return; }
    if (!paymentMethod) { setError("Please select a payment method."); return; }
    if (!transactionType) { setError("Please select a transaction type."); return; }
    if (!needOrWant) { setError("Please select Need or Want."); return; }

    setLoading(true);
    const result = await onAdd({ amount, category, platform, payment_method: paymentMethod, transaction_type: transactionType, need_or_want: needOrWant, date, notes });
    setLoading(false);

    if (result.error) { setError(result.error); return; }
    setError("");
    setAmount("");
    setCategory("");
    setPlatform("");
    setPaymentMethod("");
    setTransactionType("");
    setNeedOrWant("");
    setDate("");
    setNotes("");
  };

  return (
    <div aria-label="Add expense">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            Platform
            <select required value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="form-input">
              <option value="">Select</option>
              {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Date (required)
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <PillToggle label="Payment Method" options={paymentMethods} value={paymentMethod} onChange={(v) => setPaymentMethod(v as PaymentMethod)} />
          <PillToggle label="Transaction Type" options={transactionTypes} value={transactionType} onChange={(v) => setTransactionType(v as TransactionType)} />
          <PillToggle label="Need or Want" options={needOrWantOptions} value={needOrWant} onChange={(v) => setNeedOrWant(v as NeedOrWant)} />
        </div>

        <div className="mt-3">
          <label className="flex flex-col gap-1.5 text-sm">
            Notes (optional)
            <input type="text" maxLength={120} placeholder="e.g. Lunch with friends" value={notes} onChange={(e) => setNotes(e.target.value)} className="form-input" />
          </label>
        </div>

        <div className="flex justify-end mt-3">
          <button type="submit" disabled={loading} className="btn-primary-pill">
            {loading ? "Adding..." : "➕ Add Expense"}
          </button>
        </div>
      </form>
      {error && <p className="text-destructive text-sm mt-1.5" role="alert">{error}</p>}
    </div>
  );
};

export default AddExpenseForm;
