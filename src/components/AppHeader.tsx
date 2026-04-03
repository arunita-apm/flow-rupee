import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  showSubtitle?: boolean;
}

const AppHeader = ({ showSubtitle = false }: AppHeaderProps) => {
  const { profile, signOut } = useAuth();
  const initial = profile?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="py-4 px-4 border-b border-border/5 relative" style={{
      background: 'var(--gradient-header)',
      boxShadow: 'var(--shadow-header)',
    }}>
      <div className="max-w-[960px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Rupee logo */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(260 60% 55%) 0%, hsl(270 70% 65%) 100%)" }}
          >
            ₹
          </div>
          <div>
            <h1 className="text-xl font-bold m-0 text-primary-foreground leading-tight">Rupee Flow</h1>
            {showSubtitle && (
              <p className="text-xs opacity-80 m-0 text-primary-foreground/70 leading-tight">Know every rupee</p>
            )}
          </div>
        </div>

        {profile?.name && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={signOut}
              className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border cursor-pointer hover:bg-accent transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
