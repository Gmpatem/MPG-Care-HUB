import { getInvoiceDetail } from "@/features/billing/server/get-invoice-detail";
import { InvoiceDetailPage } from "@/features/billing/components/invoice-detail-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string; invoiceId: string }>;
};

export default async function BillingInvoiceDetailPage({ params }: PageProps) {
  const { hospitalSlug, invoiceId } = await params;
  const data = await getInvoiceDetail(hospitalSlug, invoiceId);

  return (
    <InvoiceDetailPage
      hospitalSlug={data.hospital.slug}
      invoice={data.invoice}
      items={data.items}
      payments={data.payments}
    />
  );
}