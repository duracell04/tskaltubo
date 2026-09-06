import { NextResponse } from "next/server";
import { userClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const url = new URL(request.url),
    code = url.searchParams.get("code"),
    locale = ["de", "en", "ka"].includes(url.searchParams.get("locale") ?? "")
      ? url.searchParams.get("locale")
      : "en";
  const client = await userClient();
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      await client.rpc("accept_invitation");
      return NextResponse.redirect(new URL(`/${locale}/workspace`, url.origin));
    }
  }
  return NextResponse.redirect(
    new URL(`/${locale}/workspace?auth=failed`, url.origin),
  );
}
