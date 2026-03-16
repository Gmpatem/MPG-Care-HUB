import Link from "next/link";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function LabOrdersNewInfoPage({ params }: PageProps) {
  const { hospitalSlug } = await params;

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Lab ordering entry</p>
        <h1 className="text-3xl font-semibold tracking-tight">Order Lab Tests</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Lab orders should be created from the doctor patient workspace so they stay linked to the correct patient and encounter.
        </p>
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Recommended workflow</h2>
        <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-2">
          <li>Open the doctor patient workspace</li>
          <li>Open the patient’s encounter or lab-order form</li>
          <li>Create the lab order from there so patient and encounter context are preserved</li>
        </ol>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/doctor`}>Go to Doctor Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/lab/orders`}>Open Lab Queue</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}