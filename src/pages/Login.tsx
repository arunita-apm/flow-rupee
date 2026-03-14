import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const formatted = phone.startsWith("+") ? phone : `+91${phone}`;
    if (formatted.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: formatted });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const formatted = phone.startsWith("+") ? phone : `+91${phone}`;
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (err) setError(err.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-bg)' }}>
      <div className="section-card w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-foreground">Rupee Flow</h1>
          <p className="text-sm text-muted">Know every rupee</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              Phone Number
              <div className="flex gap-2">
                <span className="form-input w-14 flex items-center justify-center text-center bg-secondary">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  className="form-input flex-1"
                  required
                />
              </div>
            </label>
            <button type="submit" disabled={loading} className="btn-primary-pill text-sm">
              {loading ? "Sending OTP..." : "Send OTP 📲"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              OTP sent to +91{phone}
            </p>
            <label className="flex flex-col gap-1.5 text-sm">
              Enter OTP
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                className="form-input text-center text-lg tracking-widest"
                required
              />
            </label>
            <button type="submit" disabled={loading} className="btn-primary-pill text-sm">
              {loading ? "Verifying..." : "Verify OTP ✅"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
              className="text-sm text-muted underline cursor-pointer bg-transparent border-none"
            >
              Change number
            </button>
          </form>
        )}

        {error && <p className="text-destructive text-sm mt-3 text-center" role="alert">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
