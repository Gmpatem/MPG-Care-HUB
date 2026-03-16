import { createClient } from "@/lib/supabase/server";

export async function occupyBed(hospitalId: string, bedId: string | null) {
  if (!bedId) return;
  const supabase = await createClient();

  const { error } = await supabase
    .from("beds")
    .update({
      status: "occupied",
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospitalId)
    .eq("id", bedId);

  if (error) throw new Error(error.message);
}

export async function releaseBed(hospitalId: string, bedId: string | null) {
  if (!bedId) return;
  const supabase = await createClient();

  const { error } = await supabase
    .from("beds")
    .update({
      status: "available",
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospitalId)
    .eq("id", bedId);

  if (error) throw new Error(error.message);
}
