import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Onboarding = () => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    const parsedSalary = parseFloat(salary);
    if (Number.isNaN(parsedSalary) || parsedSalary < 0) {
      setError("Please enter a valid salary.");
      return;
    }
    if (!user) return;

    setLoading(true);
    const phone = user.phone || "";

    const { error: err } = await supabase.from("users").upsert({
      user_id: user.id,
      name: name.trim(),
      monthly_salary: parsedSalary,
      phone_number: phone,
    }, { onConflict: "user_id" });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    await refreshProfile();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-bg)' }}>
      <div className="section-card w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-foreground">Welcome to Rupee Flow 🎉</h1>
          <p className="text-sm text-muted mt-1">Tell us a bit about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            First Name
            <input
              type="text"
              placeholder="e.g. Rahul"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Monthly Salary (₹)
            <input
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 50000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="form-input"
              required
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary-pill text-sm">
            {loading ? "Saving..." : "Let's Go! 🚀"}
          </button>
        </form>

        {error && <p className="text-destructive text-sm mt-3 text-center" role="alert">{error}</p>}
      </div>
    </div>
  );
};

export default Onboarding;
