import Link from "next/link";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Login", href: "/login" },
];

const footerLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Create facility", href: "/login?next=/onboarding/create-facility" },
];

export default function MarketingSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(14,122,145,1),rgba(42,179,204,1))] text-white shadow-[0_14px_30px_rgba(14,122,145,0.22)]">
              <span className="text-sm font-semibold tracking-wide">MPG</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-primary">MPG CARE HUB</p>
              <p className="text-xs text-muted-foreground">Hospital operations software</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="ghost">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Button asChild>
              <Link href="/login?next=/onboarding/create-facility">Start free trial</Link>
            </Button>
          </nav>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>

                <div className="flex flex-col gap-1 pt-8">
                  {navItems.map((item) => (
                    <Button key={item.href} asChild variant="ghost" className="justify-start">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))}

                  <Button asChild className="mt-3">
                    <Link href="/login?next=/onboarding/create-facility">Start free trial</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div>{children}</div>

      <footer className="border-t bg-background">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-[0.16em] text-primary">MPG CARE HUB</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Software for real hospital operations
            </h2>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Bring front desk, doctors, nursing, lab, pharmacy, ward, billing, and discharge
              into one connected operating system.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
