// Supabase Edge Function: firebase-otp
// Firebase ID token verify করে Supabase login credential দেয়
//
// Deploy:
//   supabase secrets set FIREBASE_PROJECT_ID=<id>
//   supabase secrets set SERVICE_ROLE_KEY=<service_role key>
//   supabase functions deploy firebase-otp

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

function b64d(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

let certCache: { certs: Record<string, string>; exp: number } | null = null;

async function getCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && certCache.exp > now) return certCache.certs;
  const res = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
  );
  if (!res.ok) throw new Error("cert fetch failed");
  const certs = await res.json();
  certCache = { certs, exp: now + 3600_000 };
  return certs;
}

// Firebase ID token verify → verified phone (E.164) return করে
async function verifyFirebaseToken(idToken: string): Promise<string> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("bad token");
  const [hB64, pB64, sB64] = parts;

  const header = JSON.parse(new TextDecoder().decode(b64d(hB64)));
  const payload = JSON.parse(new TextDecoder().decode(b64d(pB64)));
  if (header.alg !== "RS256" || !header.kid) throw new Error("bad header");

  const certs = await getCerts();
  const pem = certs[header.kid];
  if (!pem) throw new Error("unknown key");

  const der = b64d(
    pem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, "").replace(/\s+/g, ""),
  );
  const key = await crypto.subtle.importKey(
    "spki",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64d(sB64),
    new TextEncoder().encode(`${hB64}.${pB64}`),
  );
  if (!valid) throw new Error("bad signature");

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== PROJECT_ID) throw new Error("bad audience");
  if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) {
    throw new Error("bad issuer");
  }
  if (typeof payload.exp !== "number" || payload.exp < now) {
    throw new Error("expired");
  }
  if (!payload.sub) throw new Error("no subject");

  const phone = payload.phone_number as string;
  if (!phone || !phone.startsWith("+")) throw new Error("no phone");
  return phone;
}

function randomPassword(len = 32): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { idToken, name, user_type, vehicle_number } = await req.json();
    if (!idToken) throw new Error("missing idToken");

    // 1. Firebase token cryptographically verify
    const phoneE164 = await verifyFirebaseToken(idToken);
    const normalized = phoneE164.replace(/^\+/, ""); // 8801XXXXXXXXX
    if (!/^8801[3-9]\d{8}$/.test(normalized)) throw new Error("bad phone");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const email = `${normalized}@cngride.phone`;
    const oneTimePassword = randomPassword(32);

    // 2. Existing user?
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    if (profile?.id) {
      // পুরনো user → one-time password rotate
      const { error: upErr } = await admin.auth.admin.updateUserById(
        profile.id,
        { password: oneTimePassword },
      );
      if (upErr) throw upErr;
    } else {
      // নতুন user → create (handle_new_user trigger profile বানাবে)
      const { error: cErr } = await admin.auth.admin.createUser({
        email,
        password: oneTimePassword,
        email_confirm: true,
        user_metadata: {
          full_name: name || null,
          phone: normalized,
          user_type: user_type || null,
          vehicle_number: vehicle_number || null,
        },
      });
      if (cErr) throw cErr;
    }

    // 3. One-time credential client-কে দাও (HTTPS-এ, সাথে সাথে ব্যবহার হবে)
    return new Response(
      JSON.stringify({ email, password: oneTimePassword }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message || "failed" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
