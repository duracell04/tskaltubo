import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
export async function userClient() {
  if (!configured()) return null;
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (cs) => {
          try {
            cs.forEach((c) => jar.set(c.name, c.value, c.options));
          } catch {
            /* Server components cannot refresh cookies; route handlers do. */
          }
        },
      },
    },
  );
}
export function publicClient() {
  return configured()
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } },
      )
    : null;
}
export function adminClient() {
  if (!configured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("Storage publication service is not configured");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function identity() {
  const client = await userClient();
  if (!client) return { client: null, user: null, member: null };
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { client, user: null, member: null };
  const { data: member } = await client
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();
  return { client, user, member };
}
