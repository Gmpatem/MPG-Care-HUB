"use client";

import { useActionState } from "react";
import { createPrescription } from "@/features/pharmacy/actions/create-prescription";

type FormState = {
  error?: string;
};

type Props = {
  hospitalSlug: string;
  patientId: string;
  staff: Array<{ id: string; full_name: string }>;
  medications: Array<{
    id: string;
    generic_name: string;
    brand_name: string | null;
    route: string | null;
    strength: string | null;
  }>;
  encounters: Array<{ id: string; encounter_datetime: string; status: string }>;
};

const initialState: FormState = {};

export function CreatePrescriptionForm({
  hospitalSlug,
  patientId,
  staff,
  medications,
  encounters,
}: Props) {
  const action = (prevState: FormState, formData: FormData) =>
    createPrescription(hospitalSlug, patientId, prevState, formData);

  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Prescribing staff</label>
        <select
          name="prescribed_by_staff_id"
          className="mt-1 w-full rounded-md border px-3 py-2"
        >
          <option value="">Select staff</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Encounter</label>
        <select
          name="encounter_id"
          className="mt-1 w-full rounded-md border px-3 py-2"
        >
          <option value="">No linked encounter</option>
          {encounters.map((encounter) => (
            <option key={encounter.id} value={encounter.id}>
              {new Date(encounter.encounter_datetime).toLocaleString()} ·{" "}
              {encounter.status}
            </option>
          ))}
        </select>
      </div>

      {[0, 1, 2].map((index) => (
        <div key={index} className="space-y-3 rounded-lg border p-4">
          <h3 className="font-medium">Medication #{index + 1}</h3>

          <div>
            <label className="block text-sm font-medium">Medication</label>
            <select
              name="medication_id"
              className="mt-1 w-full rounded-md border px-3 py-2"
              onChange={(e) => {
                const option = e.target.selectedOptions[0];
                const wrapper = e.currentTarget.closest(".rounded-lg");
                const hiddenName =
                  wrapper?.querySelector<HTMLInputElement>(
                    'input[name="medication_name"]'
                  );
                const hiddenRoute =
                  wrapper?.querySelector<HTMLInputElement>(
                    'input[name="route"]'
                  );

                if (hiddenName) {
                  hiddenName.value = option.getAttribute("data-label") ?? "";
                }

                if (hiddenRoute) {
                  hiddenRoute.value = option.getAttribute("data-route") ?? "";
                }
              }}
            >
              <option value="">Select medication</option>
              {medications.map((med) => (
                <option
                  key={med.id}
                  value={med.id}
                  data-label={[med.generic_name, med.brand_name]
                    .filter(Boolean)
                    .join(" / ")}
                  data-route={med.route ?? ""}
                >
                  {[med.generic_name, med.brand_name, med.strength]
                    .filter(Boolean)
                    .join(" · ")}
                </option>
              ))}
            </select>

            <input type="hidden" name="medication_name" />
            <input type="hidden" name="route" />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <input
              name="dose"
              placeholder="Dose"
              className="rounded-md border px-3 py-2"
            />
            <input
              name="frequency"
              placeholder="Frequency"
              className="rounded-md border px-3 py-2"
            />
            <input
              name="duration"
              placeholder="Duration"
              className="rounded-md border px-3 py-2"
            />
            <input
              name="quantity_prescribed"
              type="number"
              min="1"
              placeholder="Quantity"
              className="rounded-md border px-3 py-2"
            />
          </div>

          <input
            name="instructions"
            placeholder="Instructions"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          name="notes"
          rows={4}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-white"
      >
        Create prescription
      </button>
    </form>
  );
}
