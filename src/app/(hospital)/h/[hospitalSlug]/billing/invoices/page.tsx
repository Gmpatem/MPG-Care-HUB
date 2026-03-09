import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function InvoicesPage({ params }: PageProps) {
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

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      status,
      total_amount,
      amount_paid,
      balance_due,
      issued_at,
      created_at,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Billing</p>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">{hospital.name}</p>
        </div>

        <Button asChild>
          <Link href={`/h/${hospital.slug}/billing/invoices/new`}>New Invoice</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Invoice No.</div>
          <div>Patient</div>
          <div>Status</div>
          <div>Total</div>
          <div>Balance</div>
          <div>Open</div>
        </div>

        {invoices && invoices.length > 0 ? (
          invoices.map((invoice) => {
            const patient = Array.isArray(invoice.patients)
              ? invoice.patients[0]
              : invoice.patients;

            return (
              <div
                key={invoice.id}
                className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm last:border-b-0"
              >
                <div className="font-medium">{invoice.invoice_number}</div>
                <div>
                  {patient
                    ? `${patient.last_name}, ${patient.first_name}`
                    : "Unknown patient"}
                </div>
                <div className="capitalize">{invoice.status}</div>
                <div>{Number(invoice.total_amount).toFixed(2)}</div>
                <div>{Number(invoice.balance_due).toFixed(2)}</div>
                <div>
                  <Link
                    href={`/h/${hospital.slug}/billing/invoices/${invoice.id}`}
                    className="text-primary underline underline-offset-4"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-sm text-muted-foreground">
            No invoices yet. Create your first invoice.
          </div>
        )}
      </div>
    </main>
  );
}
