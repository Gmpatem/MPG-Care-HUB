"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/write-audit-log";

export async function requestPatientDischarge(
  hospitalSlug: string,
  admissionId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("hospital_user_id", user.id)
    .maybeSingle();

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select("id, patient_id, status, discharge_requested")
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
    .eq("status", "admitted")
    .maybeSingle();

  if (admissionError) {
    throw new Error(admissionError.message);
  }

  if (!admission) {
    throw new Error("Admission not found");
  }

  if (admission.discharge_requested) {
    return;
  }

  const { error: updateError } = await supabase
    .from("admissions")
    .update({
      discharge_requested: true,
      discharge_requested_at: new Date().toISOString(),
      discharge_requested_by_staff_id: staffRow?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile?.id ?? user.id,
    entityType: "admission",
    entityId: admission.id,
    action: "doctor_requested_discharge",
    payload: {
      admission_id: admission.id,
      patient_id: admission.patient_id,
      discharge_requested_by_staff_id: staffRow?.id ?? null,
    },
  });

  revalidatePath(`/h/${hospitalSlug}/doctor`);
  revalidatePath(`/h/${hospitalSlug}/doctor/rounds`);
  revalidatePath(`/h/${hospitalSlug}/ward`);
  revalidatePath(`/h/${hospitalSlug}/ward/discharges`);
  revalidatePath(`/h/${hospitalSlug}/census`);
}