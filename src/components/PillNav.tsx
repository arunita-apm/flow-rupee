interface PillNavProps {
  onNavigate: (id: string) => void;
}

const navItems = [
  { id: "spending-section", label: "💪 Spending Power" },
  { id: "add-expense-section", label: "➕ Add Expense" },
  { id: "filters-section", label: "🔍 Filters" },
  { id: "expenses-section", label: "🧾 Expenses" },
  { id: "summary-section", label: "📊 Summary" },
];

const PillNav = ({ onNavigate }: PillNavProps) => (
  <nav className="mt-5 rounded-full px-3 py-2.5 border border-border backdrop-blur-sm"
    style={{ background: '#ffffffb5', boxShadow: 'var(--shadow-nav)' }}
    aria-label="Quick navigation"
  >
    <div className="flex flex-wrap gap-2 justify-center">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="px-3 py-2 text-sm rounded-full border border-[#dbe4ff] bg-secondary text-secondary-foreground cursor-pointer transition-all duration-150 hover:bg-[#d7dcff] hover:-translate-y-px"
          style={{ boxShadow: 'var(--shadow-btn)' }}
        >
          {item.label}
        </button>
      ))}
    </div>
  </nav>
);

export default PillNav;
