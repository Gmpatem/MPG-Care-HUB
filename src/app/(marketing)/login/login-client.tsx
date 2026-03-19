"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, ShieldCheck, Mail, ArrowRight, Loader2, HeartPulse } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
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
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");
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
    setMessageTone("info");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setMessageTone("error");
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
    setMessageTone("info");

    if (!fullName.trim()) {
      setMessage("Full name is required.");
      setMessageTone("error");
      setLoadingSignup(false);
      return;
    }

    if (!email.trim()) {
      setMessage("Email is required.");
      setMessageTone("error");
      setLoadingSignup(false);
      return;
    }

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageTone("error");
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
      setMessageTone("error");
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
    setMessageTone("success");
    setLoadingSignup(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setMessage("Enter your email first.");
      setMessageTone("error");
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
      setMessageTone("error");
    } else {
      setMessage("Password reset email sent. Check your inbox.");
      setMessageTone("success");
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
    setMessageTone("info");
  }

  const getMessageStyles = () => {
    switch (messageTone) {
      case "error":
        return "bg-[#e03620]/10 border-[#e03620]/20 text-[#e03620]";
      case "success":
        return "bg-[#1e8a52]/10 border-[#1e8a52]/20 text-[#1e8a52]";
      default:
        return "bg-[#f4f8fd] dark:bg-[#0c1520] border-[#c8ddef] dark:border-white/10 text-[#3a5068] dark:text-[#9ab0c4]";
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#eef5ff] dark:bg-[#080f1a] text-[#0d1b2a] dark:text-[#e8f2fa]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_.95fr]">
        {/* Left Side - Hero Section */}
        <section className="relative hidden overflow-hidden lg:flex bg-[#0b2a4a]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2ab3cc]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#534ab7]/15 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1196b0]/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-12 text-white">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] text-white shadow-lg shadow-[#0e7a91]/20">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6ccfe0]">MPG Care Hub</p>
                  <p className="text-sm text-white/70">Hospital workspace system</p>
                </div>
              </div>

              <div className="mt-14 max-w-xl space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6ccfe0]">Secure workspace access</p>
                <h1 className="text-4xl font-bold tracking-tight leading-tight">
                  Sign in to the hospital operations system without losing your place in the workflow.
                </h1>
                <p className="text-base leading-7 text-white/74">
                  Access front desk, doctor, lab, pharmacy, ward, nurse, billing, and discharge workspaces from one secure account flow.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 hover:bg-white/15 transition-colors">
                <ShieldCheck className="h-5 w-5 text-[#6ccfe0]" />
                <p className="mt-4 font-semibold">Tenant-safe access</p>
                <p className="mt-1 text-sm text-white/70">Scoped by hospital and workspace role.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 hover:bg-white/15 transition-colors">
                <Building2 className="h-5 w-5 text-[#6ccfe0]" />
                <p className="mt-4 font-semibold">One account flow</p>
                <p className="mt-1 text-sm text-white/70">Sign in, continue, or create a facility from one entry point.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side - Form Section */}
        <section className="flex items-center justify-center px-6 py-10 relative">
          <div className="absolute inset-0 pointer-events-none lg:hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2ab3cc]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#534ab7]/15 rounded-full blur-3xl" />
          </div>

          <div className="relative w-full max-w-md">
            <div className="bg-white dark:bg-[#101c2c] rounded-2xl shadow-2xl border border-[#c8ddef] dark:border-white/10 overflow-hidden">
              <div className="p-8 sm:p-10">
                {/* Mobile Logo */}
                <div className="lg:hidden mb-6 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] blur-xl opacity-40" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] text-white shadow-lg shadow-[#0e7a91]/20">
                      <HeartPulse className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1196b0]">MPG Care Hub</p>
                </div>

                <div className="space-y-2 mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-[#0d1b2a] dark:text-[#e8f2fa]">
                    Welcome back
                  </h2>
                  <p className="text-sm text-[#3a5068] dark:text-[#9ab0c4] leading-relaxed">
                    Sign in to your workspace or create a new healthcare facility account.
                  </p>
                </div>

                {!sessionState.checked ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1196b0]" />
                    <span className="ml-2 text-sm text-[#3a5068] dark:text-[#9ab0c4]">Checking current session...</span>
                  </div>
                ) : sessionState.email ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#1e8a52]/20 bg-[#1e8a52]/10 p-4 text-sm text-[#1e8a52]">
                      You are already signed in as <span className="font-semibold">{sessionState.email}</span>.
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleContinue}
                        className="h-12 bg-[#1196b0] hover:bg-[#0e7a91] text-white shadow-lg shadow-[#1196b0]/25 rounded-xl transition-all duration-300"
                      >
                        Continue to Workspace
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLogout}
                        className="h-12 border-[#c8ddef] dark:border-white/10 bg-white dark:bg-[#101c2c] text-[#3a5068] dark:text-[#9ab0c4] hover:bg-[#f4f8fd] dark:hover:bg-[#0c1520] hover:text-[#1196b0] rounded-xl transition-all duration-200"
                      >
                        Sign out and switch account
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mode Toggle */}
                    <div className="mb-6 grid grid-cols-2 gap-2 p-1 bg-[#f4f8fd] dark:bg-[#0c1520] rounded-xl border border-[#c8ddef] dark:border-white/10">
                      <Button
                        type="button"
                        variant={mode === "login" ? "default" : "ghost"}
                        onClick={() => switchMode("login")}
                        className={`h-10 rounded-lg transition-all duration-200 ${
                          mode === "login"
                            ? "bg-[#1196b0] hover:bg-[#0e7a91] text-white shadow-md"
                            : "text-[#3a5068] dark:text-[#9ab0c4] hover:text-[#1196b0] hover:bg-white dark:hover:bg-[#101c2c]"
                        }`}
                      >
                        Sign In
                      </Button>
                      <Button
                        type="button"
                        variant={mode === "signup" ? "default" : "ghost"}
                        onClick={() => switchMode("signup")}
                        className={`h-10 rounded-lg transition-all duration-200 ${
                          mode === "signup"
                            ? "bg-[#1196b0] hover:bg-[#0e7a91] text-white shadow-md"
                            : "text-[#3a5068] dark:text-[#9ab0c4] hover:text-[#1196b0] hover:bg-white dark:hover:bg-[#101c2c]"
                        }`}
                      >
                        Create Account
                      </Button>
                    </div>

                    {/* Message */}
                    {message ? (
                      <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${getMessageStyles()}`}>
                        {message}
                      </div>
                    ) : null}

                    {/* Login Form */}
                    {mode === "login" ? (
                      <form onSubmit={handlePasswordLogin} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#3a5068] dark:text-[#9ab0c4] ml-1">
                            Email address
                          </label>
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="you@hospital.com"
                              autoComplete="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-12 bg-[#f4f8fd] dark:bg-[#0c1520] border-[#c8ddef] dark:border-white/10 text-[#0d1b2a] dark:text-[#e8f2fa] placeholder:text-[#6a87a0] focus:border-[#1196b0] focus:ring-[#1196b0]/20 rounded-xl transition-all duration-200"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a87a0]">
                              <Mail className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-medium text-[#3a5068] dark:text-[#9ab0c4]">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={handleForgotPassword}
                              disabled={loadingRecovery}
                              className="text-xs text-[#1196b0] hover:text-[#0e7a91] transition-colors disabled:opacity-50"
                            >
                              {loadingRecovery ? "Sending..." : "Forgot password?"}
                            </button>
                          </div>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12 bg-[#f4f8fd] dark:bg-[#0c1520] border-[#c8ddef] dark:border-white/10 text-[#0d1b2a] dark:text-[#e8f2fa] placeholder:text-[#6a87a0] focus:border-[#1196b0] focus:ring-[#1196b0]/20 rounded-xl transition-all duration-200"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={loadingPassword}
                          className="h-12 w-full bg-[#1196b0] hover:bg-[#0e7a91] text-white shadow-lg shadow-[#1196b0]/25 rounded-xl transition-all duration-300 disabled:opacity-50 group"
                        >
                          {loadingPassword ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Signing in...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Sign In
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          )}
                        </Button>
                      </form>
                    ) : (
                      /* Signup Form */
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#3a5068] dark:text-[#9ab0c4] ml-1">
                            Full name
                          </label>
                          <Input
                            type="text"
                            placeholder="Dr. Sarah Chen"
                            autoComplete="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="h-12 bg-[#f4f8fd] dark:bg-[#0c1520] border-[#c8ddef] dark:border-white/10 text-[#0d1b2a] dark:text-[#e8f2fa] placeholder:text-[#6a87a0] focus:border-[#1196b0] focus:ring-[#1196b0]/20 rounded-xl transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#3a5068] dark:text-[#9ab0c4] ml-1">
                            Email address
                          </label>
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="you@hospital.com"
                              autoComplete="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-12 bg-[#f4f8fd] dark:bg-[#0c1520] border-[#c8ddef] dark:border-white/10 text-[#0d1b2a] dark:text-[#e8f2fa] placeholder:text-[#6a87a0] focus:border-[#1196b0] focus:ring-[#1196b0]/20 rounded-xl transition-all duration-200"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a87a0]">
                              <Mail className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#3a5068] dark:text-[#9ab0c4] ml-1">
                            Create password
                          </label>
                          <Input
                            type="password"
                            placeholder="Min. 6 characters"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="h-12 bg-[#f4f8fd] dark:bg-[#0c1520] border-[#c8ddef] dark:border-white/10 text-[#0d1b2a] dark:text-[#e8f2fa] placeholder:text-[#6a87a0] focus:border-[#1196b0] focus:ring-[#1196b0]/20 rounded-xl transition-all duration-200"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={loadingSignup}
                          className="h-12 w-full bg-[#1196b0] hover:bg-[#0e7a91] text-white shadow-lg shadow-[#1196b0]/25 rounded-xl transition-all duration-300 disabled:opacity-50 group"
                        >
                          {loadingSignup ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating account...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Create Account
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          )}
                        </Button>
                      </form>
                    )}

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-[#c8ddef] dark:border-white/10 text-center">
                      <Link
                        href="/"
                        className="text-sm text-[#6a87a0] dark:text-[#9ab0c4] hover:text-[#1196b0] transition-colors underline underline-offset-4"
                      >
                        Back to home
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-[#6a87a0] dark:text-[#9ab0c4]">
                Protected by enterprise-grade security.
                <span className="text-[#1e8a52] dark:text-[#34a86b]"> HIPAA compliant</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
