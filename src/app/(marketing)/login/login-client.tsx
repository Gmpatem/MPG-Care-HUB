"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SessionState = {
  checked: boolean;
  email: string | null;
};

export default function LoginClient() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionState, setSessionState] = useState<SessionState>({
    checked: false,
    email: null,
  });

  const next = searchParams.get("next") || "/platform";

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setSessionState({
        checked: true,
        email: user?.email ?? null,
      });
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingPassword(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoadingPassword(false);
      return;
    }

    await supabase.auth.getUser();
    window.location.replace(next);
  }

  async function handleMagicLink() {
    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    setLoadingMagic(true);
    setMessage("");

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Magic link sent. Check your email.");
    }

    setLoadingMagic(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    setLoadingRecovery(true);
    setMessage("");

    const resetUrl = new URL("/auth/callback", window.location.origin);
    resetUrl.searchParams.set("next", "/reset-password");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl.toString(),
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent. Check your inbox.");
    }

    setLoadingRecovery(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSessionState({
      checked: true,
      email: null,
    });
    window.location.reload();
  }

  function handleContinue() {
    window.location.replace(next);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to MPG Care Hub</CardTitle>
          <CardDescription>
            Sign in with password or request a magic link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!sessionState.checked ? (
            <p className="text-sm text-muted-foreground">Checking current session...</p>
          ) : sessionState.email ? (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                You are already signed in as{" "}
                <span className="font-medium">{sessionState.email}</span>.
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleContinue}>Continue</Button>
                <Button type="button" variant="outline" onClick={handleLogout}>
                  Sign out and switch account
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button type="submit" className="w-full" disabled={loadingPassword}>
                  {loadingPassword ? "Signing in..." : "Sign in with Password"}
                </Button>
              </form>

              <div className="mt-4 grid gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMagicLink}
                  disabled={loadingMagic}
                >
                  {loadingMagic ? "Sending..." : "Send Magic Link"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleForgotPassword}
                  disabled={loadingRecovery}
                >
                  {loadingRecovery ? "Sending reset..." : "Forgot / Set Password"}
                </Button>
              </div>

              {message ? (
                <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                  {message}
                </div>
              ) : null}
            </>
          )}

          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <p className="break-all">After login you will return to: {next}</p>
            <p>
              Need a clean logout?{" "}
              <Link href="/logout" className="underline underline-offset-4">
                Open logout route
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
