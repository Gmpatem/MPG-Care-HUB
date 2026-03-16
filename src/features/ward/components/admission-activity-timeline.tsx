import Link from "next/link";
import { Button } from "@/components/ui/button";

type EventItem = {
  id: string;
  type:
    | "admission"
    | "transfer"
    | "vitals"
    | "nurse_note"
    | "doctor_round"
    | "lab_order"
    | "lab_result"
    | "prescription"
    | "dispensation"
    | "billing"
    | "discharge_requested"
    | "nurse_clearance"
    | "discharged";
  title: string;
  description: string;
  at: string;
  href?: string | null;
};

function fullName(patient: {
  first_name: string;
  middle_name: string | null;
  last_name: string;
} | null) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function tone(type: EventItem["type"]) {
  switch (type) {
    case "admission":
      return "bg-blue-100 text-blue-700";
    case "transfer":
      return "bg-violet-100 text-violet-700";
    case "vitals":
      return "bg-emerald-100 text-emerald-700";
    case "nurse_note":
      return "bg-sky-100 text-sky-700";
    case "doctor_round":
      return "bg-indigo-100 text-indigo-700";
    case "lab_order":
    case "lab_result":
      return "bg-cyan-100 text-cyan-700";
    case "prescription":
    case "dispensation":
      return "bg-teal-100 text-teal-700";
    case "billing":
      return "bg-amber-100 text-amber-700";
    case "discharge_requested":
      return "bg-orange-100 text-orange-700";
    case "nurse_clearance":
      return "bg-fuchsia-100 text-fuchsia-700";
    case "discharged":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function AdmissionActivityTimeline({
  hospitalSlug,
  admission,
  events,
}: {
  hospitalSlug: string;
  admission: {
    id: string;
    admitted_at: string;
    patient: {
      patient_number: string | null;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      phone: string | null;
    } | null;
    ward: {
      name: string;
      code: string | null;
    } | null;
    bed: {
      bed_number: string;
    } | null;
  };
  events: EventItem[];
}) {
  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Admission Activity Timeline</p>
          <h1 className="text-3xl font-semibold tracking-tight">{fullName(admission.patient)}</h1>
          <p className="text-sm text-muted-foreground">
            {admission.patient?.patient_number ?? "No patient number"} · Ward {admission.ward?.name ?? "—"} · Bed {admission.bed?.bed_number ?? "Unassigned"}
          </p>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
          <p>Admitted: {formatDateTime(admission.admitted_at)}</p>
          <p>Phone: {admission.patient?.phone ?? "—"}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>Back to Ward Chart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}`}>Open Nurse Chart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
          </Button>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Unified inpatient story across ward, nurse, doctor, lab, pharmacy, billing, and discharge.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No activity recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${tone(event.type)}`}>
                        {event.type.replaceAll("_", " ")}
                      </span>
                      <h3 className="font-medium">{event.title}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(event.at)}</p>
                  </div>

                  {event.href ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={event.href}>Open</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}