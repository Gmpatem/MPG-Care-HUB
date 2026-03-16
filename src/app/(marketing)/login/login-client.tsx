"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
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

type AuthMode = "login" | "signup";

export default function LoginClient() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);

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

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingSignup(true);
    setMessage("");

    if (!fullName.trim()) {
      setMessage("Full name is required.");
      setLoadingSignup(false);
      return;
    }

    if (!email.trim()) {
      setMessage("Email is required.");
      setLoadingSignup(false);
      return;
    }

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setLoadingSignup(false);
      return;
    }

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", "/onboarding/create-facility");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoadingSignup(false);
      return;
    }

    const signedInUser = data.user;
    const hasSession = !!data.session;

    if (signedInUser) {
      await supabase.from("profiles").upsert(
        {
          id: signedInUser.id,
          full_name: fullName.trim(),
          email: signedInUser.email ?? email,
        },
        {
          onConflict: "id",
        }
      );
    }

    if (hasSession) {
      await supabase.auth.getUser();
      window.location.replace("/onboarding/create-facility");
      return;
    }

    setMessage(
      "Account created. Check your email to verify your account, then continue to facility setup."
    );
    setLoadingSignup(false);
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

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_.95fr]">
        <section className="hero-mesh relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_88%_-4%,rgba(42,179,204,0.25),transparent),radial-gradient(ellipse_35%_40%_at_-8%_88%,rgba(83,74,183,0.18),transparent)]" />
          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-12 text-white">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow-light">MPG Care Hub</p>
                  <p className="text-sm text-white/70">Hospital workspace system</p>
                </div>
              </div>

              <div className="mt-14 max-w-xl space-y-4">
                <p className="eyebrow-light">Secure workspace access</p>
                <h1 className="text-4xl font-semibold tracking-tight">
                  Sign in to the hospital operations system without losing your place in the workflow.
                </h1>
                <p className="text-base leading-7 text-white/74">
                  Access front desk, doctor, lab, pharmacy, ward, nurse, billing, and discharge workspaces from one secure account flow.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <ShieldCheck className="h-5 w-5" />
                <p className="mt-4 font-medium">Tenant-safe access</p>
                <p className="mt-1 text-sm text-white/70">Scoped by hospital and workspace role.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <Building2 className="h-5 w-5" />
                <p className="mt-4 font-medium">One account flow</p>
                <p className="mt-1 text-sm text-white/70">Sign in, continue, or create a facility from one entry point.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <Card className="w-full max-w-md rounded-[1.4rem] border-border/80 shadow-[0_18px_50px_rgba(13,27,42,0.06)]">
            <CardHeader className="space-y-3 pb-2">
              <div className="lg:hidden">
                <p className="eyebrow">MPG Care Hub</p>
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription className="text-sm leading-6">
                Sign in to your workspace or create a new healthcare facility account.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!sessionState.checked ? (
                <p className="text-sm text-muted-foreground">Checking current session...</p>
              ) : sessionState.email ? (
                <div className="space-y-4">
                  <div className="rounded-xl border bg-muted/40 p-3 text-sm">
                    You are already signed in as <span className="font-medium">{sessionState.email}</span>.
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
                  <div className="mb-5 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={mode === "login" ? "default" : "outline"}
                      onClick={() => switchMode("login")}
                    >
                      Sign In
                    </Button>
                    <Button
                      type="button"
                      variant={mode === "signup" ? "default" : "outline"}
                      onClick={() => switchMode("signup")}
                    >
                      Create Account
                    </Button>
                  </div>

                  {message ? (
                    <div className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      {message}
                    </div>
                  ) : null}

                  {mode === "login" ? (
                    <>
                      <form onSubmit={handlePasswordLogin} className="space-y-4">
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 rounded-xl"
                        />

                        <Input
                          type="password"
                          placeholder="Password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 rounded-xl"
                        />

                        <Button type="submit" className="h-11 w-full" disabled={loadingPassword}>
                          {loadingPassword ? "Signing in..." : "Sign in with Password"}
                        </Button>
                      </form>

                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={handleForgotPassword}
                          disabled={loadingRecovery}
                        >
                          {loadingRecovery ? "Sending reset email..." : "Forgot password?"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <Input
                        type="text"
                        placeholder="Full name"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />

                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />

                      <Input
                        type="password"
                        placeholder="Create password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />

                      <Button type="submit" className="h-11 w-full" disabled={loadingSignup}>
                        {loadingSignup ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  )}

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    <Link href="/" className="underline underline-offset-4">
                      Back to home
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
