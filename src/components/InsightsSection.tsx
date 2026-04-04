import { useState } from "react";
import { type Transaction, formatCurrency } from "@/lib/expenses";
import { Moon, Calendar, CreditCard, BellOff, TrendingDown, Target, ChevronUp, ChevronDown, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface InsightCard {
  icon: LucideIcon;
  headline: string;
  explanation: string;
  tip: string;
  bg: string;
}

function buildInsights(transactions: Transaction[]): InsightCard[] {
  const subs = transactions.filter((t) => t.transaction_type === "Subscription/Autopay");
  const subsTotal = subs.reduce((s, t) => s + t.amount, 0);

  const impulse = transactions.filter((t) => t.need_or_want === "Impulse");
  const impulseByCat: Record<string, number> = {};
  impulse.forEach((t) => {
    impulseByCat[t.category] = (impulseByCat[t.category] || 0) + t.amount;
  });
  const topImpulseCat = Object.entries(impulseByCat).sort((a, b) => b[1] - a[1])[0];

  const bgColors = [
    "bg-purple-50 border-purple-200",
    "bg-blue-50 border-blue-200",
    "bg-amber-50 border-amber-200",
  ];

  return [
    {
      icon: Moon,
      headline: "You shop late at night",
      explanation: "Most impulse buys happen after 10pm. Your wallet needs a bedtime.",
      tip: "Try setting a spending curfew — no purchases after 10pm for a week and see the difference!",
      bg: bgColors[0],
    },
    {
      icon: Calendar,
      headline: "Weekends cost you 3x more",
      explanation: "Weekend avg 3,800 vs 1,200 weekdays. Mostly food and transport.",
      tip: "Plan weekend activities in advance with a fixed budget. Free outings can be just as fun!",
      bg: bgColors[1],
    },
    {
      icon: CreditCard,
      headline: "Card makes you spend more",
      explanation: "Avg UPI spend 340 vs credit card 1,180. Same categories, different habit.",
      tip: "Switch to UPI for daily expenses. The friction of seeing money leave instantly helps control spending.",
      bg: bgColors[2],
    },
    {
      icon: BellOff,
      headline: "Money leaving silently",
      explanation: `Subscriptions are taking ${formatCurrency(subsTotal)}/month. When did you last use all of them?`,
      tip: "Review each subscription today. Cancel anything you haven't used in the last 2 weeks.",
      bg: bgColors[0],
    },
    {
      icon: TrendingDown,
      headline: "Broke week paradox",
      explanation: "You spend MORE in the last week than the first. Mostly food delivery.",
      tip: "Try the envelope method — divide your monthly budget into 4 weekly envelopes.",
      bg: bgColors[1],
    },
    {
      icon: Target,
      headline: "Top impulse category",
      explanation: topImpulseCat
        ? `${topImpulseCat[0]} is your #1 impulse buy. ${formatCurrency(topImpulseCat[1])} unplanned this month.`
        : "No impulse spending tracked yet — keep logging to unlock this insight!",
      tip: "Add impulse buys to a wishlist instead. If you still want it after 48 hours, then buy it.",
      bg: bgColors[2],
    },
  ];
}

function InsightCardItem({ card, onExpand }: { card: InsightCard; onExpand: () => void }) {
  const Icon = card.icon;

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-2 ${card.bg} cursor-pointer`}
      onClick={onExpand}
    >
      <div className="flex items-center gap-2">
        <Icon size={22} className="text-foreground/70 shrink-0" />
        <h3 className="text-base font-bold m-0 text-foreground">{card.headline}</h3>
      </div>
      <p className="text-sm text-muted-foreground m-0 leading-snug">{card.explanation}</p>
      <button
        onClick={(e) => { e.stopPropagation(); onExpand(); }}
        className="text-xs font-semibold mt-1 text-left text-primary hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer p-0 flex items-center gap-1"
      >
        Finance tip <ChevronDown size={12} />
      </button>
    </div>
  );
}

function ExpandedInsightCard({ card, onClose }: { card: InsightCard; onClose: () => void }) {
  const Icon = card.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className={`rounded-2xl border p-6 flex flex-col gap-3 w-full max-w-md max-h-[90vh] overflow-y-auto ${card.bg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={28} className="text-foreground/70" />
            <h3 className="text-lg font-bold m-0 text-foreground">{card.headline}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground m-0 leading-relaxed">{card.explanation}</p>
        <div className="bg-white/60 rounded-xl p-4 mt-2">
          <p className="text-xs font-semibold text-primary m-0 mb-1">Finance Tip</p>
          <p className="text-sm text-foreground/80 m-0 leading-relaxed">{card.tip}</p>
        </div>
      </div>
    </div>
  );
}

const InsightsSection = ({ transactions }: { transactions: Transaction[] }) => {
  const insights = buildInsights(transactions);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Show 3 cards at a time, paginated
  const pageSize = 3;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(insights.length / pageSize);
  const visibleCards = insights.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="flex flex-col gap-4">
      <div className="section-card text-center">
        <h2 className="text-xl font-semibold m-0 mb-1">Smart Insights</h2>
        <p className="text-sm text-muted-foreground m-0">
          Patterns we noticed in your spending
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {visibleCards.map((card, i) => (
          <InsightCardItem
            key={page * pageSize + i}
            card={card}
            onExpand={() => setExpandedIndex(page * pageSize + i)}
          />
        ))}
      </div>

      {/* Dot indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all ${
                i === page ? "bg-primary scale-110" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}

      {expandedIndex !== null && (
        <ExpandedInsightCard
          card={insights[expandedIndex]}
          onClose={() => setExpandedIndex(null)}
        />
      )}
    </div>
  );
};

export default InsightsSection;
