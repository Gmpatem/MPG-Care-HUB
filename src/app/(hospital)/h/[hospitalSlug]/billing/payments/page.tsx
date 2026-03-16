import { getPaymentsPageData } from "@/features/billing/server/get-payments-page-data";
import { PaymentsPage } from "@/features/billing/components/payments-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function BillingPaymentsPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getPaymentsPageData(hospitalSlug);

  return (
    <PaymentsPage
      hospitalSlug={data.hospital.slug}
      payments={data.payments}
      invoices={data.invoices}
    />
  );
}