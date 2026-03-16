import { getLabPageData } from "@/features/lab/server/get-lab-page-data";
import { CreateLabTestForm } from "@/features/lab/components/create-lab-test-form";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function NewLabTestPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getLabPageData(hospitalSlug);

  return (
    <div className="max-w-3xl">
      <CreateLabTestForm
        hospitalSlug={data.hospital.slug}
        departments={data.departments}
      />
    </div>
  );
}