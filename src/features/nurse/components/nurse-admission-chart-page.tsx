import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecordNurseVitalsForm } from "@/features/nurse/components/record-nurse-vitals-form";
import { AddNurseNoteForm } from "@/features/nurse/components/add-nurse-note-form";
import { VitalsTimelineChart } from "@/features/nurse/components/vitals-timeline-chart";
import { OpenAdmissionActivityButton } from "@/features/ward/components/open-admission-activity-button";
import { DischargeChecklistPanel } from "@/features/ward/components/discharge-checklist-panel";
import { TaskReadinessSummary } from "@/components/layout/task-readiness-summary";
import {
  SharedPatientContext,
  fullName,
  formatDateTime,
} from "@/components/layout/shared-patient-context";
import { RelatedActionsSection } from "@/components/layout/related-workspace-actions";
import { getDischargeReadiness } from "@/lib/ui/task-state";

type PatientInfo = {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  patient_number?: string | null;
  phone?: string | null;
} | null;

type DoctorInfo = {
  full_name: string;
} | null;

type WardInfo = {
  name: string;
} | null;

type BedInfo = {
  bed_number: string;
} | null;

type AdmissionInfo = {
  id: string;
  admitted_at: string;
  admission_reason: string | null;
  discharge_requested?: boolean | null;
  discharge_requested_at?: string | null;
  patient: PatientInfo;
  ward: WardInfo;
  bed: BedInfo;
  admitting_doctor: DoctorInfo;
};

type VitalInfo = {
  id: string;
  recorded_at: string;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  notes: string | null;
};

type NoteInfo = {
  id: string;
  note_type: string;
  note_text: string;
  created_at: string;
  recorded_by_staff: {
    full_name: string;
  } | null;
};

function DischargeReadinessSummary({
  admission,
  checklist,
}: {
  admission: AdmissionInfo;
  checklist: {
    summary: {
      total: number;
      completed: number;
      required_total: number;
      required_completed: number;
      ready: boolean;
    };
  };
}) {
  const signal = getDischargeReadiness(
    checklist.summary.ready,
    admission.discharge_requested ?? false,
    checklist.summary.completed,
    checklist.summary.total,
    checklist.summary.required_completed,
    checklist.summary.required_total
  );

  return <TaskReadinessSummary signal={signal} title="Discharge Status" />;
}

export function NurseAdmissionChartPage({
  hospitalSlug,
  admission,
  vitals,
  notes,
  checklist,
}: {
  hospitalSlug: string;
  admission: AdmissionInfo;
  vitals: VitalInfo[];
  notes: NoteInfo[];
  checklist: {
    items: Array<{
      key: string;
      label: string;
      required: boolean;
      completed: boolean;
      notes: string | null;
    }>;
    summary: {
      total: number;
      completed: number;
      required_total: number;
      required_completed: number;
      ready: boolean;
    };
  };
}) {
  return (
    <main className="space-y-6">
      {/* Shared Patient Context Header */}
      <SharedPatientContext
        hospitalSlug={hospitalSlug}
        patient={admission.patient}
        admission={{
          ...admission,
          ward: admission.ward ? { name: admission.ward.name } : null,
          bed: admission.bed ? { bed_number: admission.bed.bed_number } : null,
          admitting_doctor: admission.admitting_doctor ? { full_name: admission.admitting_doctor.full_name } : null,
        }}
        showRelatedLinks={true}
        primaryItems={[
          { label: "Admitted", value: formatDateTime(admission.admitted_at) },
          { label: "Ward", value: admission.ward?.name },
          { label: "Bed", value: admission.bed?.bed_number },
          { label: "Doctor", value: admission.admitting_doctor?.full_name },
        ]}
        secondaryItems={[
          { label: "Phone", value: admission.patient?.phone },
          { label: "Reason", value: admission.admission_reason },
          { label: "Discharge Requested", value: admission.discharge_requested ? "Yes" : "No" },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/h/${hospitalSlug}/nurse`}>Back to Nurse Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>Open Ward Chart</Link>
          </Button>
          <OpenAdmissionActivityButton
            hospitalSlug={hospitalSlug}
            admissionId={admission.id}
            variant="outline"
            size="sm"
          />
        </div>
      </SharedPatientContext>

      {/* Related Actions */}
      <RelatedActionsSection
        hospitalSlug={hospitalSlug}
        patientId={admission.patient?.patient_number ? admission.patient?.patient_number : undefined}
        admissionId={admission.id}
        currentWorkspace="nurse"
        title="Continue Care"
      />

      {/* Discharge Readiness Summary */}
      <DischargeReadinessSummary admission={admission} checklist={checklist} />

      <DischargeChecklistPanel
        hospitalSlug={hospitalSlug}
        admissionId={admission.id}
        items={checklist.items}
        summary={checklist.summary}
      />

      <VitalsTimelineChart vitals={vitals} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <RecordNurseVitalsForm hospitalSlug={hospitalSlug} admissionId={admission.id} />
        <AddNurseNoteForm hospitalSlug={hospitalSlug} admissionId={admission.id} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Recent Vitals</h2>
            <p className="text-sm text-muted-foreground">
              Latest nurse and inpatient vitals for this admission.
            </p>
          </div>

          {vitals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No vitals recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {vitals.map((vital) => (
                <div key={vital.id} className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">{formatDateTime(vital.recorded_at)}</p>
                  <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-3">
                    <p>Temp: {vital.temperature_c ?? "—"} °C</p>
                    <p>BP: {vital.blood_pressure_systolic ?? "—"} / {vital.blood_pressure_diastolic ?? "—"}</p>
                    <p>Pulse: {vital.pulse_bpm ?? "—"} bpm</p>
                    <p>Resp: {vital.respiratory_rate ?? "—"} / min</p>
                    <p>SpO2: {vital.spo2 ?? "—"} %</p>
                    <p>Pain: {vital.pain_score ?? "—"} / 10</p>
                  </div>
                  {vital.notes ? (
                    <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                      {vital.notes}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Recent Nurse Notes</h2>
            <p className="text-sm text-muted-foreground">
              Bedside observations and monitoring notes for this admission.
            </p>
          </div>

          {notes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No nurse notes recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {note.note_type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(note.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-foreground">{note.note_text}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    By: {note.recorded_by_staff?.full_name ?? "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
