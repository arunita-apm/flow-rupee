const AppHeader = () => (
  <header className="text-center py-6 px-4 border-b border-border/5" style={{
    background: 'var(--gradient-header)',
    boxShadow: 'var(--shadow-header)',
  }}>
    <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2 text-primary-foreground">Rupee Flow</h1>
    <p className="text-sm opacity-90 m-0 text-primary-foreground/80">Know every rupee</p>
  </header>
);

export default AppHeader;
