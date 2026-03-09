import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function BillingPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (!hospital) notFound();

  const { count: invoiceCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("hospital_id", hospital.id);

  const { data: totals } = await supabase
    .from("invoices")
    .select("total_amount, balance_due")
    .eq("hospital_id", hospital.id);

  const totalBilled = (totals ?? []).reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0);
  const totalOutstanding = (totals ?? []).reduce((sum, row) => sum + Number(row.balance_due ?? 0), 0);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Billing</p>
          <h1 className="text-3xl font-bold">Billing Overview</h1>
          <p className="text-muted-foreground">{hospital.name}</p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href={`/h/${hospital.slug}/billing/invoices/new`}>New Invoice</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/billing/invoices`}>View Invoices</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Invoices</p>
          <h2 className="mt-2 text-3xl font-bold">{invoiceCount ?? 0}</h2>
        </div>
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Total Billed</p>
          <h2 className="mt-2 text-3xl font-bold">{totalBilled.toFixed(2)}</h2>
        </div>
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <h2 className="mt-2 text-3xl font-bold">{totalOutstanding.toFixed(2)}</h2>
        </div>
      </div>
    </main>
  );
}
