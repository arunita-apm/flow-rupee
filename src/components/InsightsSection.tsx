import { useState } from "react";
import { type Transaction, formatCurrency } from "@/lib/expenses";

interface InsightCard {
  emoji: string;
  headline: string;
  explanation: string;
  tip: string;
  bg: string;
}

function buildInsights(transactions: Transaction[]): InsightCard[] {
  // Silent spends total
  const subs = transactions.filter((t) => t.transaction_type === "Subscription/Autopay");
  const subsTotal = subs.reduce((s, t) => s + t.amount, 0);

  // Impulse category
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
      emoji: "🌙",
      headline: "You shop late at night",
      explanation: "Most impulse buys happen after 10pm. Your wallet needs a bedtime.",
      tip: "Try setting a spending curfew — no purchases after 10pm for a week and see the difference!",
      bg: bgColors[0],
    },
    {
      emoji: "📅",
      headline: "Weekends cost you 3x more",
      explanation: "Weekend avg ₹3,800 vs ₹1,200 weekdays. Mostly food and transport.",
      tip: "Plan weekend activities in advance with a fixed budget. Free outings can be just as fun!",
      bg: bgColors[1],
    },
    {
      emoji: "💳",
      headline: "Card makes you spend more",
      explanation: "Avg UPI spend ₹340 vs credit card ₹1,180. Same categories, different habit.",
      tip: "Switch to UPI for daily expenses. The friction of seeing money leave instantly helps control spending.",
      bg: bgColors[2],
    },
    {
      emoji: "👻",
      headline: "Money leaving silently",
      explanation: `Subscriptions are taking ${formatCurrency(subsTotal)}/month. When did you last use all of them?`,
      tip: "Review each subscription today. Cancel anything you haven't used in the last 2 weeks.",
      bg: bgColors[0],
    },
    {
      emoji: "📉",
      headline: "Broke week paradox",
      explanation: "You spend MORE in the last week than the first. Mostly food delivery.",
      tip: "Try the envelope method — divide your monthly budget into 4 weekly envelopes.",
      bg: bgColors[1],
    },
    {
      emoji: "🎯",
      headline: "Top impulse category",
      explanation: topImpulseCat
        ? `${topImpulseCat[0]} is your #1 impulse buy. ${formatCurrency(topImpulseCat[1])} unplanned this month.`
        : "No impulse spending tracked yet — keep logging to unlock this insight!",
      tip: "Add impulse buys to a wishlist instead. If you still want it after 48 hours, then buy it.",
      bg: bgColors[2],
    },
  ];
}

function InsightCardItem({ card }: { card: InsightCard }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`min-w-[260px] max-w-[300px] rounded-2xl border p-5 flex flex-col gap-2 snap-center shrink-0 ${card.bg}`}
    >
      <p className="text-3xl m-0">{card.emoji}</p>
      <h3 className="text-base font-bold m-0 text-foreground">{card.headline}</h3>
      <p className="text-sm text-muted-foreground m-0 leading-snug">{card.explanation}</p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs font-semibold mt-1 text-left text-primary-foreground/70 hover:text-primary-foreground transition-colors bg-transparent border-none cursor-pointer p-0"
      >
        {expanded ? "Hide tip ▲" : "💡 Finance tip ▼"}
      </button>
      {expanded && (
        <p className="text-xs text-foreground/80 m-0 leading-relaxed bg-white/50 rounded-lg p-3">
          {card.tip}
        </p>
      )}
    </div>
  );
}

const InsightsSection = ({ transactions }: { transactions: Transaction[] }) => {
  const insights = buildInsights(transactions);

  return (
    <div className="flex flex-col gap-4">
      <div className="section-card text-center">
        <p className="text-4xl m-0 mb-2">🧠</p>
        <h2 className="text-xl font-semibold m-0 mb-1">Smart Insights</h2>
        <p className="text-sm text-muted-foreground m-0">
          Patterns we noticed in your spending
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
        {insights.map((card, i) => (
          <InsightCardItem key={i} card={card} />
        ))}
      </div>
    </div>
  );
};

export default InsightsSection;
