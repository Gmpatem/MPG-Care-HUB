import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20">
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            MPG Care Hub
          </p>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            Practical hospital and clinic operations software for growing healthcare teams.
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            A multi-tenant healthcare management system for patient registration,
            appointments, encounters, billing, payments, and staff access management.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/platform">Platform Console</Link>
          </Button>
        </div>

        <div className="grid gap-4 pt-6 md:grid-cols-3">
          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Patient Registry</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Register and manage patient records in a clean hospital-scoped workflow.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Clinical Flow</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Book appointments, capture encounters, and keep core clinical notes organized.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Billing and Payments</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create invoices, record payments, and track balances across hospital tenants.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
