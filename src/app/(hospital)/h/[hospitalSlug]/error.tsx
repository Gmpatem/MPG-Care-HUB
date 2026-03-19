"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HospitalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.error("[MPG Care Hub] Hospital workspace error:", error);
  }, [error]);

  const hospitalHomeHref = useMemo(() => {
    if (!pathname) return "/";

    const match = pathname.match(/^\/h\/([^/]+)/);
    if (!match) return "/";

    return `/h/${match[1]}`;
  }, [pathname]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6">
      <div className="hero-mesh w-full max-w-2xl rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]">
        <div className="rounded-[1.52rem] bg-white/92 p-6 text-center dark:bg-[#101c2c]/88 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="mt-5 space-y-2">
            <p className="eyebrow text-red-600 dark:text-red-300">Workspace issue</p>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              This page couldn&apos;t load right now
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
              A temporary issue prevented this workspace from loading properly. Your data has not been
              changed by this error. Try again, or return to the hospital overview and continue from there.
            </p>

            {error?.digest ? (
              <p className="pt-1 text-xs text-muted-foreground">
                Reference: {error.digest}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Button asChild variant="outline">
              <Link href={hospitalHomeHref}>Go to Hospital Overview</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
