import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-muted-foreground">
              MPG Care Hub
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/platform">Platform</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Built for hospitals, clinics, maternity centers, and private practices
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Practical hospital operations software for growing healthcare teams.
              </h1>

              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                MPG Care Hub helps healthcare teams manage patient registration,
                appointments, encounters, billing, payments, staff access, and
                multi-tenant hospital workspaces in one clean system.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">Get Started</Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <Link href="/platform">Open Platform Console</Link>
              </Button>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="rounded-xl border p-4">
                <p className="text-2xl font-bold">Multi-tenant</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  One platform for many hospitals and clinics
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-2xl font-bold">Fast MVP</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Built for practical workflows, not feature bloat
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-2xl font-bold">Secure</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Role-based access with hospital data isolation
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-background p-5">
                <h2 className="text-lg font-semibold">Patient Registry</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Register, search, and manage patient records in a hospital-scoped system.
                </p>
              </div>

              <div className="rounded-xl border bg-background p-5">
                <h2 className="text-lg font-semibold">Appointments</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Book visits, organize schedules, and keep front-desk flow simple.
                </p>
              </div>

              <div className="rounded-xl border bg-background p-5">
                <h2 className="text-lg font-semibold">Encounters</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Capture basic clinical notes, vitals, assessment, and plan.
                </p>
              </div>

              <div className="rounded-xl border bg-background p-5">
                <h2 className="text-lg font-semibold">Billing & Payments</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create invoices, record payments, and track balances with clarity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          <div className="rounded-xl border p-6">
            <h3 className="text-lg font-semibold">For hospital admins</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage staff roles, invitations, access, and hospital workflows from one place.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h3 className="text-lg font-semibold">For clinical teams</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Support patient visits with streamlined appointments and encounter notes.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h3 className="text-lg font-semibold">For growing systems</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start lean now and expand later without rebuilding the foundation.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
