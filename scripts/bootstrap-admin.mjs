import { createClient } from "@supabase/supabase-js";
const email = process.argv[2]?.toLowerCase();
if (!email)
  throw new Error(
    "Usage: node --env-file=.env.local scripts/bootstrap-admin.mjs verified-owner@example.com",
  );
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw new Error("Supabase environment configuration required");
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
let user;
for (let page = 1; page <= 100; page++) {
  const { data, error } = await client.auth.admin.listUsers({
    page,
    perPage: 100,
  });
  if (error) throw error;
  user = data.users.find(
    (u) => u.email?.toLowerCase() === email && u.email_confirmed_at,
  );
  if (user || data.users.length < 100) break;
}
if (!user)
  throw new Error(
    "Owner must first sign in through Google and have a verified email. No user created, no email sent.",
  );
const { error } = await client
  .from("memberships")
  .upsert({
    user_id: user.id,
    role: "admin",
    active: true,
    display_name: "Project sponsor",
  });
if (error) throw error;
console.log(
  "Verified project owner granted administrator access. No invitation messages sent.",
);
