import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function PaymentsPage({ params }: PageProps) {
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

  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      id,
      payment_date,
      amount,
      method,
      reference_number,
      created_at,
      invoices (
        id,
        invoice_number,
        patients (
          id,
          patient_number,
          first_name,
          last_name
        )
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("payment_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Billing</p>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">{hospital.name}</p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/h/${hospital.slug}/billing/invoices`}>View Invoices</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Date</div>
          <div>Invoice</div>
          <div>Patient</div>
          <div>Amount</div>
          <div>Method</div>
          <div>Reference</div>
        </div>

        {payments && payments.length > 0 ? (
          payments.map((payment) => {
            const invoice = Array.isArray(payment.invoices)
              ? payment.invoices[0]
              : payment.invoices;

            const patientData = invoice?.patients;
            const patient = Array.isArray(patientData)
              ? patientData[0]
              : patientData;

            return (
              <div
                key={payment.id}
                className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm last:border-b-0"
              >
                <div>{new Date(payment.payment_date).toLocaleString()}</div>
                <div>{invoice?.invoice_number ?? "-"}</div>
                <div>
                  {patient
                    ? `${patient.last_name}, ${patient.first_name}`
                    : "-"}
                </div>
                <div>{Number(payment.amount).toFixed(2)}</div>
                <div className="capitalize">{payment.method}</div>
                <div>{payment.reference_number ?? "-"}</div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-sm text-muted-foreground">
            No payments recorded yet.
          </div>
        )}
      </div>
    </main>
  );
}
