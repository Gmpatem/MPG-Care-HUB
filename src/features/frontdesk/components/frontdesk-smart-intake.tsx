"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Loader2, 
  Search, 
  UserPlus, 
  X,
  ArrowRight,
  Calendar,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { InlineError } from "@/components/feedback/inline-feedback";
import { createOrQueuePatient, type CreateOrQueuePatientState } from "@/features/frontdesk/actions/create-or-queue-patient";

type StaffLite = {
  id: string;
  full_name: string;
  job_title: string | null;
  staff_type: string | null;
  active: boolean;
};

type SearchPatient = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  date_of_birth: string | null;
  phone: string | null;
  email?: string | null;
  address_text?: string | null;
  status: string | null;
  follow_up?: {
    id: string;
    follow_up_date: string;
    reason: string | null;
    doctor_staff_id: string | null;
    doctor_name: string | null;
  } | null;
};

type FormState = CreateOrQueuePatientState;

type Props = {
  hospitalSlug: string;
  staff: StaffLite[];
  compact?: boolean;
};

const initialState: FormState = {};

function fullName(patient: SearchPatient) {
  return [patient.first_name, patient.middle_name, patient.last_name]
    .filter(Boolean)
    .join(" ");
}

function calculateAge(dob: string | null) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function FrontdeskSmartIntake({ hospitalSlug, staff, compact = false }: Props) {
  const action = (prevState: FormState, formData: FormData) =>
    createOrQueuePatient(hospitalSlug, prevState, formData);

  const [state, formAction, pending] = useActionState(action, initialState);

  // Search state
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchPatient[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Selected patient state
  const [selectedPatient, setSelectedPatient] = useState<SearchPatient | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("unknown");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressText, setAddressText] = useState("");

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset on success
  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        clearSelection();
        setSearch("");
        setResults([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  // Search effect
  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await fetch(
          `/h/${hospitalSlug}/frontdesk/intake/search?q=${encodeURIComponent(query)}`,
          { method: "GET", cache: "no-store" }
        );

        if (!response.ok) {
          setResults([]);
          setSearching(false);
          return;
        }

        const data = (await response.json()) as { patients?: SearchPatient[] };
        setResults(data.patients ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, hospitalSlug]);

  function applyPatient(patient: SearchPatient) {
    setSelectedPatient(patient);
    setFirstName(patient.first_name ?? "");
    setMiddleName(patient.middle_name ?? "");
    setLastName(patient.last_name ?? "");
    setSex(patient.sex ?? "unknown");
    setDateOfBirth(patient.date_of_birth ?? "");
    setPhone(patient.phone ?? "");
    setEmail(patient.email ?? "");
    setAddressText(patient.address_text ?? "");
    setShowRegistration(false);
    setResults([]);
    setSearch("");
  }

  function clearSelection() {
    setSelectedPatient(null);
    setShowRegistration(false);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSex("unknown");
    setDateOfBirth("");
    setPhone("");
    setEmail("");
    setAddressText("");
  }

  function startNewRegistration() {
    clearSelection();
    setShowRegistration(true);
    setResults([]);
  }

  const scheduledAt = new Date().toISOString();

  // Success overlay
  if (showSuccess) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-emerald-900">
          Patient Added to Queue
        </h3>
        <p className="mt-1 text-sm text-emerald-700">
          {selectedPatient ? fullName(selectedPatient) : "New patient"} has been checked in successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Step 1: Patient Search */}
      {!selectedPatient && !showRegistration && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, phone, or patient number..."
              className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Matching patients ({results.length})
              </p>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {results.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => applyPatient(patient)}
                    className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{fullName(patient)}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.patient_number && <span className="mr-2">ID: {patient.patient_number}</span>}
                          {patient.phone && <span>{patient.phone}</span>}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {patient.date_of_birth && (
                            <span>Age: {calculateAge(patient.date_of_birth) ?? "—"}</span>
                          )}
                          {patient.sex && patient.sex !== "unknown" && (
                            <Badge variant="outline" className="capitalize text-xs">
                              {patient.sex}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {patient.follow_up && (
                      <div className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        Follow-up: {new Date(patient.follow_up.follow_up_date).toLocaleDateString()}
                        {patient.follow_up.doctor_name && ` · ${patient.follow_up.doctor_name}`}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results - offer registration */}
          {search.trim().length >= 2 && !searching && results.length === 0 && (
            <WorkspaceEmptyState
              variant="search"
              title="No matching patients"
              description="Try a different search term or register a new patient if this is their first visit."
              action={
                <Button onClick={startNewRegistration}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register New Patient
                </Button>
              }
            />
          )}

          {/* Quick action for new registration */}
          {search.trim().length === 0 && (
            <div className="flex items-center justify-center gap-2 py-2">
              <span className="text-sm text-muted-foreground">or</span>
              <Button 
                onClick={startNewRegistration}
                variant="ghost" 
                className="text-sm"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Register a new patient
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Selected Patient Context */}
      {selectedPatient && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{fullName(selectedPatient)}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPatient.patient_number && `ID: ${selectedPatient.patient_number} · `}
                  {selectedPatient.phone || "No phone"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={clearSelection}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Existing Patient
            </Badge>
            <span className="text-xs text-muted-foreground">
              Proceed to check-in below
            </span>
          </div>
        </div>
      )}

      {/* Step 3: Registration / Check-in Form */}
      {(selectedPatient || showRegistration) && (
        <form action={formAction} className="space-y-5">
          <input
            type="hidden"
            name="existing_patient_id"
            value={selectedPatient?.id ?? ""}
          />
          <input type="hidden" name="scheduled_at" value={scheduledAt} />
          <input type="hidden" name="visit_type" value="outpatient" />
          <input type="hidden" name="appointment_type" value="walk_in" />
          <input type="hidden" name="assignment_mode" value="manual" />

          {/* Error message */}
          {state?.message && !state.success && (
            <InlineError message={state.message} />
          )}

          {/* Registration header for new patients */}
          {showRegistration && !selectedPatient && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">New Patient</Badge>
              <span>Enter details below</span>
            </div>
          )}

          {/* Patient Details Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Patient Information</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium">First Name *</span>
                <input
                  name="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Last Name *</span>
                <input
                  name="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Middle Name</span>
                <input
                  name="middle_name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Sex</span>
                <select
                  name="sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="unknown">Unknown</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Date of Birth</span>
                <input
                  name="date_of_birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Phone</span>
                <input
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63..."
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium">Address</span>
                <textarea
                  name="address_text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>
          </div>

          {/* Visit Details Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Visit Details</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Assigned Staff</span>
                <select
                  name="staff_id"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Auto assign</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                      {member.job_title ? ` - ${member.job_title}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium">Reason for Visit</span>
                <input
                  name="reason"
                  placeholder="Main complaint..."
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium">Notes</span>
                <textarea
                  name="arrival_notes"
                  rows={2}
                  placeholder="Optional front desk notes..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>
          </div>

          {/* Vitals Section - Collapsed for new patients, shown for existing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Vitals (Optional)</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Temp (°C)</span>
                <input
                  name="temperature_c"
                  type="number"
                  step="0.1"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">BP Systolic</span>
                <input
                  name="blood_pressure_systolic"
                  type="number"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">BP Diastolic</span>
                <input
                  name="blood_pressure_diastolic"
                  type="number"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Pulse</span>
                <input
                  name="pulse_bpm"
                  type="number"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">SpO2 (%)</span>
                <input
                  name="spo2"
                  type="number"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Weight (kg)</span>
                <input
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t">
            <Button
              type="submit"
              disabled={pending}
              className="min-w-[160px]"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedPatient ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Check In Patient
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register & Check In
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={clearSelection}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
