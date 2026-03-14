import { useAuth } from "@/contexts/AuthContext";

const AppHeader = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="text-center py-6 px-4 border-b border-border/5 relative" style={{
      background: 'var(--gradient-header)',
      boxShadow: 'var(--shadow-header)',
    }}>
      <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2 text-primary-foreground">Rupee Flow</h1>
      <p className="text-sm opacity-90 m-0 text-primary-foreground/80">Know every rupee</p>
      {profile?.name && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <span className="text-xs text-muted">Hey {profile.name} 👋</span>
          <button
            onClick={signOut}
            className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border cursor-pointer hover:bg-accent transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
