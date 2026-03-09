import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPatient } from "@/features/patients/actions/create-patient";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function NewPatientPage({ params, searchParams }: PageProps) {
  const { hospitalSlug } = await params;
  const { success } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (!hospital) notFound();

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Patients</p>
        <h1 className="text-3xl font-bold">Register Patient</h1>
        <p className="text-muted-foreground">{hospital.name}</p>
      </div>

      {success === "1" ? (
        <FormMessage type="success" message="Patient saved successfully." />
      ) : null}

      <form action={createPatient} className="max-w-3xl space-y-6 rounded-xl border p-6">
        <input type="hidden" name="hospital_id" value={hospital.id} />

        <FormMessage
          type="info"
          message="Patient number will be generated automatically when you save."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input name="first_name" placeholder="John" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <Input name="last_name" placeholder="Doe" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Middle Name</label>
            <Input name="middle_name" placeholder="Optional" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sex</label>
            <select
              name="sex"
              defaultValue="unknown"
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="other">other</option>
              <option value="unknown">unknown</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth</label>
            <Input name="date_of_birth" type="date" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input name="phone" placeholder="+237..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input name="email" type="email" placeholder="patient@email.com" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <Textarea name="address_text" placeholder="Patient address" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Contact Name</label>
            <Input name="emergency_contact_name" placeholder="Emergency contact full name" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Contact Phone</label>
            <Input name="emergency_contact_phone" placeholder="+237..." />
          </div>
        </div>

        <div className="flex gap-3">
          <SubmitButton pendingText="Saving patient...">
            Save Patient
          </SubmitButton>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/patients`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </main>
  );
}
