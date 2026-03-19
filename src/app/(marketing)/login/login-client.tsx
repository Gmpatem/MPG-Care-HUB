"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";
import { getFriendlyErrorMessage } from "@/lib/ui/get-friendly-error-message";
import { InlineFeedback } from "@/components/feedback/inline-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MessageTone = "error" | "success" | "info";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const next = searchParams.get("next") || "/platform";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const [isPending, startTransition] = useTransition();
  const [isResetPending, startResetTransition] = useTransition();

  async function handlePasswordLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageTone("info");

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(getFriendlyErrorMessage(error));
        setMessageTone("error");
        return;
      }

      setMessage("Signing you in...");
      setMessageTone("success");

      router.replace(next);
      router.refresh();
    });
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setMessage("Enter your email first so we know where to send the reset link.");
      setMessageTone("info");
      return;
    }

    setMessage("");
    setMessageTone("info");

    startResetTransition(async () => {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setMessage(getFriendlyErrorMessage(error));
        setMessageTone("error");
        return;
      }

      setMessage("Password reset email sent. Check your inbox for the reset link.");
      setMessageTone("success");
    });
  }

  return (
    <div className="w-full max-w-md">
      <div className="hero-mesh rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]">
        <div className="rounded-[1.52rem] bg-white/92 p-6 dark:bg-[#101c2c]/88 sm:p-7">
          <div className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(14,122,145,1),rgba(42,179,204,1))] text-white shadow-[0_14px_30px_rgba(14,122,145,0.22)]">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="eyebrow">MPG Care Hub</p>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Sign in to your workspace
              </h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Access your hospital workflow, patient queues, and operational dashboards.
              </p>
            </div>
          </div>

          {message ? (
            <div className="mt-5">
              <InlineFeedback message={message} tone={messageTone} />
            </div>
          ) : null}

          <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Email</span>
              <Input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@hospital.com"
                className="h-11"
                disabled={isPending || isResetPending}
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Password</span>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-11"
                disabled={isPending || isResetPending}
              />
            </label>

            <div className="flex flex-col gap-3 pt-1">
              <Button type="submit" disabled={isPending || isResetPending} className="h-11">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleForgotPassword}
                disabled={isPending || isResetPending}
                className="h-11"
              >
                {isResetPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Forgot Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
