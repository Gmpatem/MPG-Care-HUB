import { createClient } from "@/lib/supabase/server";

type GeneratePatientNumberParams = {
  hospitalId: string;
  hospitalSlug: string;
};

function sanitizeSlug(slug: string) {
  return slug.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "HOSP";
}

function formatDatePart(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export async function generatePatientNumber({
  hospitalId,
  hospitalSlug,
}: GeneratePatientNumberParams) {
  const supabase = await createClient();

  const prefix = sanitizeSlug(hospitalSlug);
  const datePart = formatDatePart();

  const { count, error } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("hospital_id", hospitalId);

  if (error) {
    throw new Error(error.message);
  }

  const running = String((count ?? 0) + 1).padStart(5, "0");
  return `${prefix}-${datePart}-${running}`;
}