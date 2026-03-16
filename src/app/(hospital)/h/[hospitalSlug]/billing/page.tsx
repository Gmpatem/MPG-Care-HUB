import { getBillingDashboard } from "@/features/billing/server/get-billing-dashboard";
import { BillingDashboardPage } from "@/features/billing/components/billing-dashboard-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function BillingPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getBillingDashboard(hospitalSlug);

  return (
    <BillingDashboardPage
      hospitalSlug={data.hospital.slug}
      hospitalName={data.hospital.name}
      currencyCode={data.hospital.currency_code}
      stats={data.stats}
      invoices={data.invoices}
      payments={data.payments}
    />
  );
}