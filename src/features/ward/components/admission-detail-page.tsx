import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NurseNoteForm } from "@/features/ward/components/nurse-note-form";
import { advanceAdmissionWorkflowStep } from "@/features/ward/actions/advance-admission-workflow-step";
import { toggleDischargeChecklistItem } from "@/features/ward/actions/toggle-discharge-checklist-item";
import { AdmissionTransferForm } from "@/features/ward/components/admission-transfer-form";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function AdmissionDetailPage({
  hospitalSlug,
  admission,
  workflowState,
  workflowConfig,
  workflowSteps,
  dischargeChecklist,
  transfers,
  wards,
  beds,
  nurseNotes,
  vitals,
  rounds,
}: {
  hospitalSlug: string;
  admission: any;
  workflowState: any;
  workflowConfig: any;
  workflowSteps: any[];
  dischargeChecklist: any[];
  transfers: any[];
  wards: any[];
  beds: any[];
  nurseNotes: any[];
  vitals: any[];
  rounds: any[];
}) {
  const currentIndex = workflowSteps.findIndex((step) => step.step_key === workflowState?.current_step_key);
  const nextStep = currentIndex >= 0 ? workflowSteps[currentIndex + 1] : null;

  const transferAllowed =
    workflowConfig?.allow_ward_transfer || workflowConfig?.allow_bed_transfer;

  const destinationBeds = beds.filter((bed: any) => bed.ward_id !== null);

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admission detail</p>
          <h1 className="text-3xl font-semibold tracking-tight">Ward Admission</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review admitted patient details, nursing notes, vitals, doctor rounds, discharge checklist, and transfers.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/census`}>Back to Census</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Workflow Progress</h2>
            <p className="text-sm text-muted-foreground">
              {workflowConfig?.name ?? "No workflow config"} · Current step: {workflowState?.current_step_key ?? "Not initialized"}
            </p>

            {workflowSteps.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {workflowSteps.map((step) => {
                  const isCurrent = workflowState?.current_step_key === step.step_key;
                  const isDone = currentIndex >= 0 && step.sort_order < (workflowSteps[currentIndex]?.sort_order ?? 0);

                  return (
                    <span
                      key={step.id}
                      className={`rounded-full px-3 py-1 text-xs ${
                        isCurrent
                          ? "bg-blue-100 text-blue-700"
                          : isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {step.step_name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No workflow steps configured.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {nextStep ? (
              <form action={advanceAdmissionWorkflowStep}>
                <input type="hidden" name="hospital_slug" value={hospitalSlug} />
                <input type="hidden" name="admission_id" value={admission.id} />
                <Button type="submit">
                  Move to {nextStep.step_name}
                </Button>
              </form>
            ) : (
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Final workflow step reached.
              </div>
            )}

            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/config`}>View Ward Config</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Patient</p>
            <h2 className="mt-1 text-lg font-semibold">{fullName(admission.patient)}</h2>
            <p className="text-sm text-muted-foreground">
              {admission.patient?.patient_number ?? "No patient number"} · {admission.patient?.sex ?? "unknown"} · {admission.patient?.phone ?? "No phone"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Emergency: {admission.patient?.emergency_contact_name ?? "—"} · {admission.patient?.emergency_contact_phone ?? "—"}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Admission Summary</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="font-medium">Status:</span> {admission.status}</p>
              <p><span className="font-medium">Admitted At:</span> {formatDateTime(admission.admitted_at)}</p>
              <p><span className="font-medium">Ward:</span> {admission.ward?.name ?? "—"}</p>
              <p><span className="font-medium">Bed:</span> {admission.bed?.bed_number ?? "Unassigned"}</p>
              <p><span className="font-medium">Doctor:</span> {admission.doctor?.full_name ?? "Unknown"}</p>
              <p><span className="font-medium">Discharge Requested:</span> {admission.discharge_requested ? "Yes" : "No"}</p>
              <p><span className="font-medium">Discharge Requested At:</span> {formatDateTime(admission.discharge_requested_at)}</p>
              <p><span className="font-medium">Requested By:</span> {admission.discharge_requested_by?.full_name ?? "—"}</p>
            </div>

            <div className="mt-4">
              <p className="font-medium">Admission Reason</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {admission.admission_reason || "—"}
              </p>
            </div>

            <div className="mt-4">
              <p className="font-medium">Discharge Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {admission.discharge_notes || "—"}
              </p>
            </div>
          </div>

          <NurseNoteForm
            hospitalSlug={hospitalSlug}
            admissionId={admission.id}
          />

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Nurse Notes</h2>

            {nurseNotes.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No nurse notes recorded yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {nurseNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {note.note_type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(note.created_at)}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {note.note_text}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Recorded by: {note.recorded_by_staff?.full_name ?? "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Discharge Checklist</h2>

            {dischargeChecklist.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No discharge checklist configured for this workflow.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {dischargeChecklist.map((item: any) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.item_label}</p>
                        {item.required ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                            required
                          </span>
                        ) : null}
                        {item.state?.completed ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                            completed
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            pending
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Key: {item.item_key}
                      </p>

                      {item.state?.completed_at ? (
                        <p className="text-xs text-muted-foreground">
                          Completed at {formatDateTime(item.state.completed_at)} by {item.state.completed_by_staff?.full_name ?? "Unknown"}
                        </p>
                      ) : null}
                    </div>

                    <form action={async (formData) => { await toggleDischargeChecklistItem(hospitalSlug, admission.id, item.item_key, !item.completed, undefined as any, formData); }}>
                      <input type="hidden" name="hospital_slug" value={hospitalSlug} />
                      <input type="hidden" name="admission_id" value={admission.id} />
                      <input type="hidden" name="item_key" value={item.item_key} />
                      <input type="hidden" name="next_completed" value={item.state?.completed ? "false" : "true"} />
                      <Button type="submit" variant="outline">
                        {item.state?.completed ? "Mark Pending" : "Mark Complete"}
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {transferAllowed ? (
            <AdmissionTransferForm
              hospitalSlug={hospitalSlug}
              admissionId={admission.id}
              wards={wards}
              beds={destinationBeds}
              currentWardId={admission.ward_id ?? null}
            />
          ) : null}

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Transfer History</h2>

            {transfers.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No transfers recorded yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {transfers.map((transfer: any) => (
                  <div key={transfer.id} className="rounded-lg border p-4 text-sm">
                    <p className="font-medium">{formatDateTime(transfer.transferred_at)}</p>
                    <p className="mt-2 text-muted-foreground">
                      From {transfer.from_ward?.name ?? "—"} / {transfer.from_bed?.bed_number ?? "—"} to {transfer.to_ward?.name ?? "—"} / {transfer.to_bed?.bed_number ?? "—"}
                    </p>
                    {transfer.transfer_reason ? (
                      <p className="mt-2 text-muted-foreground">{transfer.transfer_reason}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      By {transfer.transferred_by_staff?.full_name ?? "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Vitals Timeline</h2>

            {vitals.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No admission-linked vitals recorded yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {vitals.map((row) => (
                  <div key={row.id} className="rounded-lg border p-4 text-sm">
                    <p className="font-medium">{formatDateTime(row.recorded_at)}</p>
                    <p className="mt-2 text-muted-foreground">
                      Temp {row.temperature_c ?? "—"} · BP {row.blood_pressure_systolic ?? "—"}/{row.blood_pressure_diastolic ?? "—"} · Pulse {row.pulse_bpm ?? "—"} · RR {row.respiratory_rate ?? "—"} · SpO2 {row.spo2 ?? "—"} · Pain {row.pain_score ?? "—"}
                    </p>
                    {row.notes ? (
                      <p className="mt-2 text-muted-foreground">{row.notes}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Recorded by: {row.recorded_by_staff?.full_name ?? "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Doctor Rounds</h2>

            {rounds.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No doctor rounds recorded yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {rounds.map((row) => (
                  <div key={row.id} className="rounded-lg border p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{formatDateTime(row.round_datetime)}</p>
                      {row.discharge_recommended ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          discharge recommended
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Doctor: {row.doctor?.full_name ?? "Unknown"}
                    </p>

                    {row.subjective_notes ? (
                      <p className="mt-2 text-muted-foreground"><span className="font-medium text-foreground">Subjective:</span> {row.subjective_notes}</p>
                    ) : null}
                    {row.objective_notes ? (
                      <p className="mt-2 text-muted-foreground"><span className="font-medium text-foreground">Objective:</span> {row.objective_notes}</p>
                    ) : null}
                    {row.assessment_notes ? (
                      <p className="mt-2 text-muted-foreground"><span className="font-medium text-foreground">Assessment:</span> {row.assessment_notes}</p>
                    ) : null}
                    {row.plan_notes ? (
                      <p className="mt-2 text-muted-foreground"><span className="font-medium text-foreground">Plan:</span> {row.plan_notes}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Next Ward Actions</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/doctor/rounds`}>Doctor Rounds</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
              </Button>
              {admission.encounter_id ? (
                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/encounters/${admission.encounter_id}`}>Open Encounter</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

