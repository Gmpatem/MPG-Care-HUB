import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PharmacyWorkflowCard({
  hospitalSlug,
  stats,
}: {
  hospitalSlug: string;
  stats: {
    total_prescriptions: number;
    ready_to_dispense: number;
    stock_blocked: number;
    completed_today: number;
  };
}) {
  return (
    <section className="space-y-4 rounded-xl border p-5">
      <div>
        <p className="text-sm text-muted-foreground">Pharmacy Workflow</p>
        <h2 className="text-xl font-semibold">What needs attention</h2>
        <p className="text-sm text-muted-foreground">
          Use this as the pharmacist’s visual workflow guide.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Prescription Queue</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_prescriptions}</div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Ready to Dispense</p>
          <div className="mt-2 text-2xl font-semibold">{stats.ready_to_dispense}</div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Needs Stock Attention</p>
          <div className="mt-2 text-2xl font-semibold">{stats.stock_blocked}</div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Completed Today</p>
          <div className="mt-2 text-2xl font-semibold">{stats.completed_today}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-muted/30 p-4">
          <h3 className="font-medium">1. Review Queue</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Open pending prescriptions and see what entered from doctors.
          </p>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospitalSlug}/pharmacy`}>Open Pharmacy Queue</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 p-4">
          <h3 className="font-medium">2. Check Medication Catalog</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add missing medications before attempting full dispensing.
          </p>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospitalSlug}/admin/medications`}>Open Medications</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 p-4">
          <h3 className="font-medium">3. Check Stock Batches</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ensure batches, quantities, and prices exist for dispensing.
          </p>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospitalSlug}/admin/pharmacy-stock`}>Open Stock</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 p-4">
          <h3 className="font-medium">4. Dispense and Record</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete dispensing so stock and patient history stay accurate.
          </p>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospitalSlug}/pharmacy`}>Start Dispensing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}