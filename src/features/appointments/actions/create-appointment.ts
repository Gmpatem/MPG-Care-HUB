"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAppointmentSchema } from "@/features/appointments/schemas/appointment.schema";

export async function createAppointment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    hospital_id: String(formData.get("hospital_id") ?? ""),
    patient_id: String(formData.get("patient_id") ?? ""),
    appointment_type: String(formData.get("appointment_type") ?? ""),
    scheduled_at: String(formData.get("scheduled_at") ?? ""),
    duration_minutes: Number(formData.get("duration_minutes") ?? 30),
    reason: String(formData.get("reason") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = createAppointmentSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid appointment data");
  }

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("id", parsed.data.hospital_id)
    .maybeSingle();

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", parsed.data.patient_id)
    .eq("hospital_id", parsed.data.hospital_id)
    .maybeSingle();

  if (!patient) {
    throw new Error("Patient not found in this hospital");
  }

  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert({
      hospital_id: parsed.data.hospital_id,
      patient_id: parsed.data.patient_id,
      appointment_type: parsed.data.appointment_type || null,
      scheduled_at: new Date(parsed.data.scheduled_at).toISOString(),
      duration_minutes: parsed.data.duration_minutes,
      status: "scheduled",
      reason: parsed.data.reason || null,
      notes: parsed.data.notes || null,
      created_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/h/${hospital.slug}/appointments`);
  redirect(`/h/${hospital.slug}/appointments/${inserted.id}`);
}

