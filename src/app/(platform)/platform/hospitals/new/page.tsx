import Link from "next/link";
import { createHospital } from "@/features/hospitals/actions/create-hospital";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewHospitalPage() {
  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">New tenant</p>
        <h1 className="text-3xl font-bold">Create Hospital</h1>
        <p className="text-muted-foreground">
          Create a new hospital, clinic, maternity center, or private practice workspace.
        </p>
      </div>

      <form action={createHospital} className="max-w-2xl space-y-6 rounded-xl border p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Hospital Name</label>
          <Input name="name" placeholder="St. Mary Clinic" required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <Input name="slug" placeholder="st-mary-clinic" required />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              name="type"
              defaultValue="clinic"
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="maternity">Maternity</option>
              <option value="practice">Practice</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Country Code</label>
            <Input name="country_code" defaultValue="CM" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <Input name="timezone" defaultValue="Africa/Douala" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Currency Code</label>
            <Input name="currency_code" defaultValue="XAF" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input name="phone" placeholder="+237..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input name="email" type="email" placeholder="contact@hospital.com" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <Textarea name="address_text" placeholder="Hospital address" />
        </div>

        <div className="flex gap-3">
          <Button type="submit">Create Hospital</Button>
          <Button asChild variant="outline">
            <Link href="/platform/hospitals">Cancel</Link>
          </Button>
        </div>
      </form>
    </main>
  );
}
