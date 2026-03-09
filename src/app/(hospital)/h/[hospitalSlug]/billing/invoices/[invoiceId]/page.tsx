import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPayment } from "@/features/billing/actions/create-payment";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    invoiceId: string;
  }>;
};

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { hospitalSlug, invoiceId } = await params;
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

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      status,
      subtotal_amount,
      discount_amount,
      tax_amount,
      total_amount,
      amount_paid,
      balance_due,
      issued_at,
      due_at,
      notes,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("id", invoiceId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!invoice) notFound();

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("id, description, quantity, unit_price, line_total, item_type")
    .eq("invoice_id", invoice.id)
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("id, payment_date, amount, method, reference_number, notes, created_at")
    .eq("invoice_id", invoice.id)
    .eq("hospital_id", hospital.id)
    .order("payment_date", { ascending: false });

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const patient = Array.isArray(invoice.patients)
    ? invoice.patients[0]
    : invoice.patients;

  const canTakePayment = Number(invoice.balance_due) > 0;

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Invoice Detail</p>
          <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-muted-foreground">
            Patient:{" "}
            {patient
              ? `${patient.patient_number} - ${patient.last_name}, ${patient.first_name}`
              : "Unknown patient"}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/h/${hospital.slug}/billing/invoices`}>Back to Invoices</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Invoice Summary</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Status:</span> {invoice.status}</p>
            <p><span className="font-medium">Issued At:</span> {invoice.issued_at ? new Date(invoice.issued_at).toLocaleString() : "-"}</p>
            <p><span className="font-medium">Subtotal:</span> {Number(invoice.subtotal_amount).toFixed(2)}</p>
            <p><span className="font-medium">Discount:</span> {Number(invoice.discount_amount).toFixed(2)}</p>
            <p><span className="font-medium">Tax:</span> {Number(invoice.tax_amount).toFixed(2)}</p>
            <p><span className="font-medium">Total:</span> {Number(invoice.total_amount).toFixed(2)}</p>
            <p><span className="font-medium">Paid:</span> {Number(invoice.amount_paid).toFixed(2)}</p>
            <p><span className="font-medium">Balance Due:</span> {Number(invoice.balance_due).toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {invoice.notes ?? "No invoice notes."}
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Invoice Items</h2>

        <div className="mt-4 rounded-lg border">
          <div className="grid grid-cols-4 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
            <div>Description</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div>Line Total</div>
          </div>

          {items && items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-4 gap-4 border-b px-4 py-3 text-sm last:border-b-0"
              >
                <div>{item.description}</div>
                <div>{Number(item.quantity).toFixed(2)}</div>
                <div>{Number(item.unit_price).toFixed(2)}</div>
                <div>{Number(item.line_total).toFixed(2)}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-sm text-muted-foreground">
              No invoice items found.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Record Payment</h2>

          {canTakePayment ? (
            <form action={createPayment} className="mt-4 space-y-4">
              <input type="hidden" name="hospital_id" value={hospital.id} />
              <input type="hidden" name="invoice_id" value={invoice.id} />

              <FormMessage
                type="info"
                message={`Outstanding balance: ${Number(invoice.balance_due).toFixed(2)}`}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={Number(invoice.balance_due).toFixed(2)}
                  defaultValue={Number(invoice.balance_due).toFixed(2)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Method</label>
                <select
                  name="method"
                  defaultValue="cash"
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="cash">cash</option>
                  <option value="mobile_money">mobile_money</option>
                  <option value="bank_transfer">bank_transfer</option>
                  <option value="card">card</option>
                  <option value="other">other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Date</label>
                <Input
                  name="payment_date"
                  type="datetime-local"
                  required
                  defaultValue={new Date().toISOString().slice(0,16)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reference Number</label>
                <Input name="reference_number" placeholder="Optional reference" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea name="notes" placeholder="Optional payment notes" />
              </div>

              <SubmitButton pendingText="Recording payment...">
                Record Payment
              </SubmitButton>
            </form>
          ) : (
            <FormMessage
              type="success"
              message="This invoice is fully paid."
            />
          )}
        </div>

        <div className="rounded-xl border p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/billing/payments`}>All Payments</Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {payments && payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className="rounded-lg border p-3 text-sm">
                  <p><span className="font-medium">Amount:</span> {Number(payment.amount).toFixed(2)}</p>
                  <p><span className="font-medium">Method:</span> {payment.method}</p>
                  <p><span className="font-medium">Date:</span> {new Date(payment.payment_date).toLocaleString()}</p>
                  <p><span className="font-medium">Reference:</span> {payment.reference_number ?? "-"}</p>
                  <p><span className="font-medium">Notes:</span> {payment.notes ?? "-"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
