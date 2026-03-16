"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { releaseBed } from "@/features/ward/server/bed-occupancy";

type ActionState = {
  success?: boolean;
  error?: string;
};

export async function completeDischarge(
  hospitalSlug: string,
  admissionId: string,
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select("id, bed_id")
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
    .maybeSingle<{ id: string; bed_id: string | null }>();

  if (admissionError) return { error: admissionError.message };
  if (!admission) return { error: "Admission not found." };

  const { error } = await supabase
    .from("admissions")
    .update({
      status: "discharged",
      discharged_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId);

  if (error) return { error: error.message };

  try {
    await releaseBed(hospital.id, admission.bed_id);
  } catch (bedError) {
    return {
      error: bedError instanceof Error ? bedError.message : "Failed to release bed.",
    };
  }

  revalidatePath(`/h/${hospitalSlug}/ward/discharges`);
  revalidatePath(`/h/${hospitalSlug}/doctor/rounds`);

  return { success: true };
}

