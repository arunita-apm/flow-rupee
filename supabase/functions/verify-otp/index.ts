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

    // Mark OTP as verified
    await supabase.from("otp_codes").update({ verified: true }).eq("id", otpRow.id);

    // Check if user exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.phone === phone
    );

    let session;

    if (existingUser) {
      // Generate a magic link / session for existing user
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `${phone.replace(/\+/g, "")}@phone.rupeeflow.app`,
      });
      if (error) throw new Error(`Generate link error: ${error.message}`);

      // Sign in with the token
      const { data: signInData, error: signInErr } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `${phone.replace(/\+/g, "")}@phone.rupeeflow.app`,
      });

      // Use admin to create a session directly
      const { data: tokenData, error: tokenErr } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: `${phone.replace(/\+/g, "")}@phone.rupeeflow.app`,
        });

      // Return the hashed token for client-side verification
      const properties = tokenData?.properties;
      session = {
        hashed_token: properties?.hashed_token,
        verification_type: "magiclink",
        email: `${phone.replace(/\+/g, "")}@phone.rupeeflow.app`,
      };
    } else {
      // Create new user
      const fakeEmail = `${phone.replace(/\+/g, "")}@phone.rupeeflow.app`;
      const { data: newUser, error: createErr } =
        await supabase.auth.admin.createUser({
          email: fakeEmail,
          phone,
          phone_confirm: true,
          email_confirm: true,
          user_metadata: { phone_number: phone },
        });
      if (createErr) throw new Error(`Create user error: ${createErr.message}`);

      // Generate login link
      const { data: tokenData, error: tokenErr } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: fakeEmail,
        });
      if (tokenErr) throw new Error(`Generate link error: ${tokenErr.message}`);

      const properties = tokenData?.properties;
      session = {
        hashed_token: properties?.hashed_token,
        verification_type: "magiclink",
        email: fakeEmail,
        is_new_user: true,
      };
    }

    // Clean up old OTPs for this phone
    await supabase.from("otp_codes").delete().eq("phone", phone);

    return new Response(JSON.stringify({ success: true, session }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("verify-otp error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
