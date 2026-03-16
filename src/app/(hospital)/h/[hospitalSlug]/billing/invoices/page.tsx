import { getInvoicesPageData } from "@/features/billing/server/get-invoices-page-data";
import { InvoicesPage } from "@/features/billing/components/invoices-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function BillingInvoicesPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getInvoicesPageData(hospitalSlug);

  return (
    <InvoicesPage
      hospitalSlug={data.hospital.slug}
      invoices={data.invoices}
    />
  );
}