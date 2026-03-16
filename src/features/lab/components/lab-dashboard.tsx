import Link from "next/link";
import { Button } from "@/components/ui/button";

type LabDashboardProps = {
  hospitalSlug: string;
  hospitalName: string;
  totalTests: number;
  activeTests: number;
  pendingOrders: number;
  completedToday: number;
};

export function LabDashboard({
  hospitalSlug,
  hospitalName,
  totalTests,
  activeTests,
  pendingOrders,
  completedToday,
}: LabDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Laboratory workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight">Lab</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the lab catalog, process active orders, and return results for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/lab/orders`}>Open Lab Queue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/lab/tests`}>View Lab Tests</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/lab/tests/new`}>Add Lab Test</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Catalog tests</p>
          <div className="mt-2 text-3xl font-semibold">{totalTests}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active for ordering</p>
          <div className="mt-2 text-3xl font-semibold">{activeTests}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Pending lab orders</p>
          <div className="mt-2 text-3xl font-semibold">{pendingOrders}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Completed today</p>
          <div className="mt-2 text-3xl font-semibold">{completedToday}</div>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Lab workflow</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Doctors place lab orders from the patient workspace</li>
          <li>Lab queue receives incoming requests immediately</li>
          <li>Lab staff enter results per requested test item</li>
          <li>Completed orders send the case back to doctor review</li>
        </ul>
      </div>
    </div>
  );
}
