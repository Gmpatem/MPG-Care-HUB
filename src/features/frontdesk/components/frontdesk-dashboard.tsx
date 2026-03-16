import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FrontdeskStats } from "@/features/frontdesk/components/frontdesk-stats";
import { FrontdeskQueuePreview } from "@/features/frontdesk/components/frontdesk-queue-preview";
import type {
  FrontdeskQueueRow,
  FrontdeskSummary,
} from "@/features/frontdesk/types";

type HospitalLite = {
  id: string;
  name: string;
  slug: string;
};

export function FrontdeskDashboard({
  hospital,
  summary,
  queueRows,
}: {
  hospital: HospitalLite;
  summary: FrontdeskSummary | null;
  queueRows: FrontdeskQueueRow[];
}) {
  return (
    <main className="space-y-6">
      <div className="mb-4 rounded-lg border bg-muted/30 p-4">
        <form
          action={`/h/${hospital.slug}/frontdesk/intake`}
          method="get"
          className="flex gap-3"
        >
          <input
            name="q"
            placeholder="Search patient by name, phone, or number..."
            className="h-10 flex-1 rounded-md border px-3 text-sm"
          />
          <button className="h-10 rounded-md border px-4 text-sm font-medium">
            Smart Intake
          </button>
        </form>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Front Desk</p>
            <h1 className="text-3xl font-bold">{hospital.name}</h1>
            <p className="text-sm text-muted-foreground">
              Search, confirm, register, and send patients straight into the live queue.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/h/${hospital.slug}/frontdesk/intake`}>
                Smart Intake
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/frontdesk/patients`}>
                Patient Search
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/frontdesk/queue`}>
                Today&apos;s Queue
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <FrontdeskStats summary={summary} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_.9fr]">
        <FrontdeskQueuePreview hospitalSlug={hospital.slug} rows={queueRows} />

        <Card>
          <CardContent className="space-y-4 py-5">
            <div>
              <h2 className="text-lg font-semibold">Front Desk Flow</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep intake fast, avoid duplicates, and hand off cleanly to clinical staff.
              </p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-lg bg-muted p-3">
                Start with Smart Intake to search for an existing patient before creating a new record.
              </div>
              <div className="rounded-lg bg-muted p-3">
                Confirm or update patient information, then send the visit straight into today&apos;s queue.
              </div>
              <div className="rounded-lg bg-muted p-3">
                Use the queue as the live handoff lane to nurse intake and doctor workflow.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
