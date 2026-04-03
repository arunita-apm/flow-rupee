import { categories, type Filters } from "@/lib/expenses";
import { RotateCcw } from "lucide-react";

interface FiltersSectionProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FiltersSection = ({ filters, onChange }: FiltersSectionProps) => (
  <section id="filters-section" className="section-card" aria-label="Expense filters">
    <h2 className="text-lg font-semibold mb-3">Filters</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        Category
        <select value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value })} className="form-input">
          <option value="">All</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Start Date
        <input type="date" value={filters.startDate} onChange={(e) => onChange({ ...filters, startDate: e.target.value })} className="form-input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        End Date
        <input type="date" value={filters.endDate} onChange={(e) => onChange({ ...filters, endDate: e.target.value })} className="form-input" />
      </label>
    </div>
    <div className="flex justify-end mt-3">
      <button
        type="button"
        onClick={() => onChange({ category: "", startDate: "", endDate: "" })}
        className="px-3 py-2 text-sm rounded-full bg-secondary text-secondary-foreground border border-border cursor-pointer transition-all duration-150 hover:bg-accent hover:-translate-y-px flex items-center gap-1.5"
      >
        <RotateCcw size={14} /> Reset Filters
      </button>
    </div>
  </section>
);

export default FiltersSection;
