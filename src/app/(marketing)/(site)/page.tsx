import Link from "next/link";
import {
  Activity,
  Building2,
  CreditCard,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Front Desk and Intake",
    body: "Register patients, search records, route arrivals, and keep queue movement clean from the first click.",
    icon: Users,
  },
  {
    title: "Doctor Workflow",
    body: "Move from consultation to investigations, prescriptions, admissions, and final clinical decisions in one flow.",
    icon: Stethoscope,
  },
  {
    title: "Laboratory and Pharmacy",
    body: "Run result-entry and medication dispensing on operational pages instead of scattered admin forms.",
    icon: FlaskConical,
  },
  {
    title: "Billing and Clearance",
    body: "Create invoices, post payments, and expose financial clearance for discharge without guesswork.",
    icon: CreditCard,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] text-white shadow-[0_10px_30px_rgba(14,122,145,0.28)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">MPG Care Hub</p>
              <p className="text-sm text-muted-foreground">Hospital operations system</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/platform">Platform Console</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="hero-mesh relative overflow-hidden rounded-[1.6rem] border border-transparent p-[1px] shadow-[0_24px_70px_rgba(11,42,74,0.12)]">
          <div className="relative rounded-[1.52rem] bg-white/92 px-7 py-10 dark:bg-[#101c2c]/88 md:px-10 md:py-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="eyebrow-light">Clinical operations platform</p>
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    One hospital workspace for Front Desk, Doctors, Lab, Pharmacy, Ward, Nurse, Billing, and Discharge.
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-white/72 sm:text-lg">
                    MPG Care Hub is built for real healthcare workflow movement, not isolated admin pages.
                    It helps hospitals coordinate intake, clinical decisions, investigations, inpatient care, and billing
                    in one system.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="bg-white text-[#0b2a4a] hover:bg-white/92">
                    <Link href="/login">Open Workspace</Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/16 hover:text-white">
                    <Link href="/platform">Platform Console</Link>
                  </Button>
                </div>

                <div className="grid gap-4 pt-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
                    <p className="text-2xl font-semibold">Multi-tenant</p>
                    <p className="mt-1 text-sm text-white/70">One platform, many hospitals.</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
                    <p className="text-2xl font-semibold">Workflow-first</p>
                    <p className="mt-1 text-sm text-white/70">Built around real clinical movement.</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
                    <p className="text-2xl font-semibold">Role-safe</p>
                    <p className="mt-1 text-sm text-white/70">Scoped by tenant and workspace access.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/12 p-5 text-white backdrop-blur-sm">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-semibold">{feature.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/72">{feature.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-2">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="surface-panel p-6 sm:p-7">
            <p className="eyebrow">What it solves</p>
            <h3 className="mt-2 text-2xl font-semibold">Hospital software should feel like an operations room, not a spreadsheet wearing a lab coat.</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              The new visual system reduces grayscale fatigue, clarifies surface hierarchy, and gives each workspace a stronger identity.
              It borrows the visual character of the MediSys HTML without changing your hospital logic.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="surface-soft p-4">
                <Activity className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">Clear hierarchy</p>
                <p className="mt-1 text-sm text-muted-foreground">Important actions stand out faster.</p>
              </div>

              <div className="surface-soft p-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">Safer workflows</p>
                <p className="mt-1 text-sm text-muted-foreground">Queue pages feel operational, not decorative.</p>
              </div>

              <div className="surface-soft p-4">
                <Building2 className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">Consistent shell</p>
                <p className="mt-1 text-sm text-muted-foreground">Less repetition, more focus.</p>
              </div>
            </div>
          </div>

          <div className="surface-panel p-6 sm:p-7">
            <p className="eyebrow">Launch points</p>
            <h3 className="mt-2 text-2xl font-semibold">Start where you work.</h3>
            <div className="mt-5 grid gap-3">
              <Button asChild className="justify-between">
                <Link href="/login">Sign in to a hospital workspace</Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/platform">Open platform administration</Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/onboarding/create-facility">Create a facility</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
