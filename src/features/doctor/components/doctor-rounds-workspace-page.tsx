import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DoctorDischargeActionBar } from "@/features/doctor/components/doctor-discharge-action-bar";
import { AddDoctorRoundNoteForm } from "@/features/doctor/components/add-doctor-round-note-form";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatHours(value: number | null) {
  if (value === null) return "—";
  if (value >= 24) {
    const days = Math.floor(value / 24);
    const hours = value % 24;
    return `${days}d ${hours}h`;
  }
  return `${value}h`;
}

export function DoctorRoundsWorkspacePage({
  hospitalSlug,
  hospitalName,
  doctor,
  patients,
  stats,
}: {
  hospitalSlug: string;
  hospitalName: string;
  doctor: {
    id: string;
    full_name: string;
    specialty: string | null;
  };
  patients: Array<{
    id: string;
    encounter_id: string | null;
    admitted_at: string;
    admission_age_hours: number | null;
    admission_reason: string | null;
    discharge_requested: boolean;
    discharge_requested_at: string | null;
    patient: {
      patient_number: string | null;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      sex: string | null;
      phone: string | null;
    } | null;
    patient_full_name: string;
    ward: {
      id: string;
      name: string;
      code: string | null;
    } | null;
    bed: {
      id: string;
      bed_number: string;
    } | null;
    latest_vitals: {
      recorded_at: string;
      temperature_c: number | null;
      blood_pressure_systolic: number | null;
      blood_pressure_diastolic: number | null;
      pulse_bpm: number | null;
      respiratory_rate: number | null;
      spo2: number | null;
      pain_score: number | null;
    } | null;
    latest_nurse_note: {
      created_at: string;
      note_type: string;
      note_text: string;
    } | null;
  }>;
  stats: {
    total_inpatients: number;
    discharge_requested: number;
    missing_vitals: number;
    no_nurse_note: number;
  };
}) {
  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Doctor Inpatient Workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight">Rounds</h1>
          <p className="text-sm text-muted-foreground">
            Active admitted patients for Dr. {doctor.full_name} in {hospitalName}.
          </p>
          <p className="text-sm text-muted-foreground">
            Specialty: {doctor.specialty ?? "General"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/doctor`}>Doctor</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward`}>Ward</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/bed-board`}>Bed Board</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active Inpatients</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_inpatients}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Discharge Requested</p>
          <div className="mt-2 text-2xl font-semibold">{stats.discharge_requested}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Missing Vitals</p>
          <div className="mt-2 text-2xl font-semibold">{stats.missing_vitals}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">No Nurse Note</p>
          <div className="mt-2 text-2xl font-semibold">{stats.no_nurse_note}</div>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No admitted patients are currently assigned to this doctor.
        </div>
      ) : (
        <div className="space-y-5">
          {patients.map((item) => (
            <section key={item.id} className="rounded-xl border p-5">
              <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{item.patient_full_name}</h2>
                    {item.discharge_requested ? (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                        discharge requested
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        inpatient
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {item.patient?.patient_number ?? "No patient number"} ·
                    Ward {item.ward?.name ?? "—"} ·
                    Bed {item.bed?.bed_number ?? "Unassigned"}
                  </p>

                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                    <p>Admitted: {formatDateTime(item.admitted_at)}</p>
                    <p>Stay: {formatHours(item.admission_age_hours)}</p>
                    <p>Phone: {item.patient?.phone ?? "—"}</p>
                    <p>Reason: {item.admission_reason ?? "—"}</p>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                    {item.latest_vitals ? (
                      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                        <p>Vitals: {formatDateTime(item.latest_vitals.recorded_at)}</p>
                        <p>BP: {item.latest_vitals.blood_pressure_systolic ?? "—"} / {item.latest_vitals.blood_pressure_diastolic ?? "—"}</p>
                        <p>Pulse: {item.latest_vitals.pulse_bpm ?? "—"} bpm</p>
                        <p>SpO2: {item.latest_vitals.spo2 ?? "—"} %</p>
                      </div>
                    ) : (
                      <p>No vitals recorded yet for this admission.</p>
                    )}
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                    {item.latest_nurse_note ? (
                      <>
                        <p className="font-medium text-foreground">
                          Latest Nurse Note · {item.latest_nurse_note.note_type}
                        </p>
                        <p className="mt-1">{item.latest_nurse_note.note_text}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDateTime(item.latest_nurse_note.created_at)}
                        </p>
                      </>
                    ) : (
                      <p>No nurse note recorded yet for this admission.</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/h/${hospitalSlug}/ward/admissions/${item.id}`}>
                        Ward Chart
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/h/${hospitalSlug}/nurse/admissions/${item.id}`}>
                        Nurse Chart
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/h/${hospitalSlug}/ward/admissions/${item.id}/activity`}>
                        Activity
                      </Link>
                    </Button>
                  </div>

                  <DoctorDischargeActionBar
                    hospitalSlug={hospitalSlug}
                    admissionId={item.id}
                    dischargeRequested={Boolean(item.discharge_requested)}
                  />
                </div>

                <AddDoctorRoundNoteForm
                  hospitalSlug={hospitalSlug}
                  admissionId={item.id}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}