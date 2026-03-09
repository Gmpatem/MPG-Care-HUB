import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(next: string | null) {
  if (!next) return "/platform";
  if (!next.startsWith("/")) return "/platform";
  if (next.startsWith("//")) return "/platform";
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNext(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "User";

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: fullName,
      },
      {
        onConflict: "id",
      }
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
