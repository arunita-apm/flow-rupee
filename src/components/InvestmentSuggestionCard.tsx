import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface InvestmentSuggestion {
  id: string;
  title: string;
  message: string;
  platform_name: string | null;
  platform_url: string | null;
}

const InvestmentSuggestionCard = () => {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState<InvestmentSuggestion | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase
        .from("investment_suggestions") as any)
        .select("id, title, message, platform_name, platform_url")
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setSuggestion(data as InvestmentSuggestion);
    })();
  }, [user]);

  const handleDismiss = async () => {
    if (!suggestion) return;
    setHidden(true);
    await (supabase.from("investment_suggestions") as any)
      .update({ is_dismissed: true })
      .eq("id", suggestion.id);
  };

  if (!suggestion || hidden) return null;

  return (
    <div className="relative rounded-2xl border border-amber-200 p-5 flex flex-col gap-2 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-sm">
      <button
        onClick={handleDismiss}
        aria-label="Dismiss suggestion"
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 bg-transparent border-none cursor-pointer"
      >
        <X size={16} className="text-foreground/60" />
      </button>

      <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
        For You
      </span>

      <h3 className="text-base font-bold m-0 text-foreground pr-6">{suggestion.title}</h3>
      <p className="text-sm text-muted-foreground m-0 leading-snug">{suggestion.message}</p>

      {suggestion.platform_name && suggestion.platform_url && (
        <a
          href={suggestion.platform_url}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold no-underline transition-colors"
        >
          Explore on {suggestion.platform_name}
        </a>
      )}
    </div>
  );
};

export default InvestmentSuggestionCard;
