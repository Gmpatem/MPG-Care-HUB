import { createClient } from "@/lib/supabase/server";
import { getAdmissionDetail } from "@/features/ward/server/get-admission-detail";
import { AdmissionDetailPage } from "@/features/ward/components/admission-detail-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string; admissionId: string }>;
};

export default async function AdmissionDetailRoute({ params }: PageProps) {
  const { hospitalSlug, admissionId } = await params;
  const data = await getAdmissionDetail(hospitalSlug, admissionId);

  const supabase = await createClient();

  const { data: wards } = await supabase
    .from("wards")
    .select("id, name, code")
    .eq("hospital_id", data.hospital.id)
    .eq("active", true)
    .order("name", { ascending: true });

  const { data: beds } = await supabase
    .from("beds")
    .select("id, ward_id, bed_number")
    .eq("hospital_id", data.hospital.id)
    .eq("active", true)
    .order("bed_number", { ascending: true });

  return (
    <AdmissionDetailPage
      hospitalSlug={data.hospital.slug}
      admission={data.admission}
      workflowState={data.workflowState}
      workflowConfig={data.workflowConfig}
      workflowSteps={data.workflowSteps}
      dischargeChecklist={data.dischargeChecklist}
      transfers={data.transfers}
      wards={wards ?? []}
      beds={beds ?? []}
      nurseNotes={data.nurseNotes}
      vitals={data.vitals}
      rounds={data.rounds}
    />
  );
}