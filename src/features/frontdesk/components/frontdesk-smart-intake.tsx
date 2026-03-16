"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
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
};

const initialState: FormState = {};

function fullName(patient: SearchPatient) {
  return [patient.first_name, patient.middle_name, patient.last_name]
    .filter(Boolean)
    .join(" ");
}

export function FrontdeskSmartIntake({ hospitalSlug, staff }: Props) {
  const action = (prevState: FormState, formData: FormData) =>
    createOrQueuePatient(hospitalSlug, prevState, formData);

  const [state, formAction, pending] = useActionState(action, initialState);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchPatient[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<SearchPatient | null>(
    null
  );

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("unknown");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressText, setAddressText] = useState("");

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
  }

  function clearSelection() {
    setSelectedPatient(null);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSex("unknown");
    setDateOfBirth("");
    setPhone("");
    setEmail("");
    setAddressText("");
  }

  const modeLabel = useMemo(() => {
    return selectedPatient ? "Existing patient selected" : "New patient intake";
  }, [selectedPatient]);

  return (
    <main className="space-y-6">
      <div className="rounded-lg border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Front Desk</p>
          <h1 className="text-3xl font-bold">Smart Intake</h1>
          <p className="text-sm text-muted-foreground">
            Search, confirm, take intake vitals, and send patients straight into
            the doctor queue.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-5">
        <div>
          <label className="block text-sm font-medium">
            Search patient by name, phone, or patient number
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Start typing patient name, phone, or number..."
            className="mt-2 h-11 w-full rounded-md border px-3 text-sm"
          />
        </div>

        {searching ? (
          <p className="text-sm text-muted-foreground">Searching...</p>
        ) : null}

        {results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Possible matches</p>
            {results.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => applyPatient(patient)}
                className="w-full rounded-lg border p-3 text-left hover:bg-muted/40"
              >
                <div className="font-medium">{fullName(patient)}</div>
                <div className="text-sm text-muted-foreground">
                  {patient.patient_number ?? "No patient number"} ·{" "}
                  {patient.phone ?? "No phone"} ·{" "}
                  {patient.date_of_birth ?? "No DOB"}
                </div>

                {patient.follow_up ? (
                  <div className="mt-1 text-xs text-amber-700">
                    Follow-up:{" "}
                    {new Date(
                      patient.follow_up.follow_up_date
                    ).toLocaleString()}
                    {patient.follow_up.doctor_name
                      ? ` · ${patient.follow_up.doctor_name}`
                      : ""}
                    {patient.follow_up.reason
                      ? ` · ${patient.follow_up.reason}`
                      : ""}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {search.trim().length >= 2 && !searching && results.length === 0 ? (
          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            No matching patient found. Continue below to register a new patient.
          </div>
        ) : null}
      </div>

      <form action={formAction} className="space-y-6 rounded-lg border p-5">
        <input
          type="hidden"
          name="selected_patient_id"
          value={selectedPatient?.id ?? ""}
        />

        {state?.message ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        <div className="rounded-md bg-muted/40 px-3 py-2 text-sm font-medium">
          {modeLabel}
          {selectedPatient ? (
            <button
              type="button"
              onClick={clearSelection}
              className="ml-3 text-sm underline"
            >
              Clear selection
            </button>
          ) : null}
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">First Name</span>
            <input
              name="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 rounded-md border px-3 text-sm"
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Middle Name</span>
            <input
              name="middle_name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Last Name</span>
            <input
              name="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 rounded-md border px-3 text-sm"
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Sex</span>
            <select
              name="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="h-11 rounded-md border px-3 text-sm"
            >
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Date of Birth</span>
            <input
              name="date_of_birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Phone</span>
            <input
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Address</span>
            <textarea
              name="address_text"
              rows={3}
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Assigned Staff / Doctor</span>
            <select
              name="staff_id"
              className="h-11 rounded-md border px-3 text-sm"
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

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Reason for visit</span>
            <input
              name="reason"
              placeholder="Main complaint or reason"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Arrival notes</span>
            <textarea
              name="arrival_notes"
              rows={3}
              placeholder="Optional cashier/front desk notes"
              className="rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Temperature (°C)</span>
            <input
              name="temperature_c"
              type="number"
              step="0.1"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Systolic BP</span>
            <input
              name="blood_pressure_systolic"
              type="number"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Diastolic BP</span>
            <input
              name="blood_pressure_diastolic"
              type="number"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Pulse (bpm)</span>
            <input
              name="pulse_bpm"
              type="number"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Respiratory Rate</span>
            <input
              name="respiratory_rate"
              type="number"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">SpO2 (%)</span>
            <input
              name="spo2"
              type="number"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Weight (kg)</span>
            <input
              name="weight_kg"
              type="number"
              step="0.1"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Pain Score (0-10)</span>
            <input
              name="pain_score"
              type="number"
              min="0"
              max="10"
              className="h-11 rounded-md border px-3 text-sm"
            />
          </label>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {pending
              ? "Saving..."
              : selectedPatient
              ? "Confirm and send to queue"
              : "Register and send to queue"}
          </button>
        </div>
      </form>
    </main>
  );
}


