"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/write-audit-log";

export type NurseDischargeClearanceState = {
  success?: boolean;
  message?: string;
};

export async function nurseDischargeClearance(
  hospitalSlug: string,
  admissionId: string,
  _prev: NurseDischargeClearanceState,
  formData: FormData
): Promise<NurseDischargeClearanceState> {
  const clearanceNotes = String(formData.get("clearance_notes") ?? "").trim();

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "You must be signed in." };
  }

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (!hospital) {
    return { success: false, message: "Hospital not found" };
  }

  const { data: admission } = await supabase
    .from("admissions")
    .select("id, status")
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
    .maybeSingle();

  if (!admission) {
    return { success: false, message: "Admission not found" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("nurse_discharge_clearance")
    .insert({
      hospital_id: hospital.id,
      admission_id: admissionId,
      clearance_notes: clearanceNotes || null,
      cleared_at: new Date().toISOString(),
    });

  if (error) {
    return { success: false, message: error.message };
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile?.id ?? user.id,
    entityType: "nurse_discharge_clearance",
    entityId: admissionId,
    action: "nurse_discharge_cleared",
    payload: {
      admission_id: admissionId,
      clearance_notes: clearanceNotes || null,
    },
  });

  revalidatePath(`/h/${hospitalSlug}/nurse`);
  revalidatePath(`/h/${hospitalSlug}/ward/discharges`);
  revalidatePath(`/h/${hospitalSlug}/nurse/admissions/${admissionId}`);

  return { success: true, message: "Patient cleared by nurse for discharge" };
}