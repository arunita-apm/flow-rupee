interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", emoji: "🏠", label: "Home" },
  { id: "add", emoji: "➕", label: "Add" },
  { id: "silent", emoji: "👻", label: "Silent" },
  { id: "insights", emoji: "🧠", label: "Insights" },
  { id: "expenses", emoji: "🧾", label: "Expenses" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
    style={{ boxShadow: "0 -2px 12px rgba(142, 197, 252, 0.15)" }}
    aria-label="Main navigation"
  >
    <div className="max-w-[960px] mx-auto flex items-end justify-around px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isAdd = tab.id === "add";

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-150 cursor-pointer border-none bg-transparent ${
              isAdd
                ? "relative -mt-4"
                : ""
            }`}
          >
            <span
              className={`text-xl leading-none flex items-center justify-center transition-all duration-150 ${
                isAdd
                  ? "w-12 h-12 rounded-full text-2xl shadow-lg"
                  : "w-8 h-8 rounded-lg"
              }`}
              style={
                isAdd
                  ? {
                      background: "linear-gradient(135deg, hsl(260 60% 55%) 0%, hsl(270 70% 65%) 100%)",
                      color: "white",
                      boxShadow: "0 4px 14px rgba(120, 80, 200, 0.35)",
                    }
                  : isActive
                  ? {
                      background: "linear-gradient(135deg, hsl(260 60% 55%) 0%, hsl(270 70% 65%) 100%)",
                      color: "white",
                    }
                  : {}
              }
            >
              {tab.emoji}
            </span>
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive || isAdd ? "text-[hsl(260,60%,55%)]" : "text-muted"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
