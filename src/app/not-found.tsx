import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="hero-mesh w-full max-w-2xl rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]">
        <div className="rounded-[1.52rem] bg-white/92 p-6 text-center dark:bg-[#101c2c]/88 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border/70">
            <SearchX className="h-6 w-6" />
          </div>

          <div className="mt-5 space-y-2">
            <p className="eyebrow">Not found</p>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              This page or record doesn&apos;t exist
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
              The link may be outdated, the record may have been removed, or the address may be incorrect.
              Return to the app and continue from a valid workspace.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/platform">Open Platform</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
