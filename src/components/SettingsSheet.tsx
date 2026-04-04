import { useState } from "react";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const SettingsSheet = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [salary, setSalary] = useState(String(profile?.monthly_salary ?? ""));
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    const val = parseFloat(salary);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from("users")
      .update({ monthly_salary: val })
      .eq("user_id", user.id);
    setLoading(false);

    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }

    await refreshProfile();
    toast.success("Monthly limit updated!");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (v) setSalary(String(profile?.monthly_salary ?? "")); }}>
      <SheetTrigger asChild>
        <button className="p-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer bg-transparent border-none">
          <Settings size={18} className="text-primary-foreground/80" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[360px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          <label className="flex flex-col gap-1.5 text-sm">
            Monthly Budget Limit
            <input
              type="number"
              step="1"
              min="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="form-input"
              placeholder="e.g. 50000"
            />
            <span className="text-xs text-muted-foreground">
              This is used to track your spending against your budget on the dashboard.
            </span>
          </label>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
