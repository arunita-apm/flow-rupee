import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { phone, code } = await req.json();
    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Phone and code are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find matching OTP
    const { data: otpRow, error: fetchErr } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (fetchErr) throw new Error(`DB fetch error: ${fetchErr.message}`);
    if (!otpRow) {
      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark OTP as verified & clean up
    await supabase.from("otp_codes").delete().eq("phone", phone);

    // Derive a stable email from phone number
    const fakeEmail = `${phone.replace(/\+/g, "")}@phone.rupeeflow.app`;

    // Check if user already exists
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find((u) => u.email === fakeEmail);

    if (!existingUser) {
      // Create new user
      const { error: createErr } = await supabase.auth.admin.createUser({
        email: fakeEmail,
        phone,
        phone_confirm: true,
        email_confirm: true,
        user_metadata: { phone_number: phone },
      });
      if (createErr) throw new Error(`Create user error: ${createErr.message}`);
    }

    // Generate magic link for sign-in
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: fakeEmail,
    });
    if (linkErr) throw new Error(`Generate link error: ${linkErr.message}`);

    const hashed_token = linkData?.properties?.hashed_token;
    if (!hashed_token) throw new Error("Failed to generate login token");

    return new Response(
      JSON.stringify({
        success: true,
        token_hash: hashed_token,
        email: fakeEmail,
        is_new_user: !existingUser,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("verify-otp error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
