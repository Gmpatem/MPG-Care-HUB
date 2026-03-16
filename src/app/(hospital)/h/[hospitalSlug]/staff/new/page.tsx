import { getStaffFormData } from "@/features/staff/server/get-staff-form-data";
import { StaffForm } from "@/features/staff/components/staff-form";
import { createStaff } from "@/features/staff/actions/create-staff";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function NewStaffPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getStaffFormData(hospitalSlug);

  const action = createStaff.bind(null, data.hospital.slug);

  return (
    <div className="max-w-4xl">
      <StaffForm
        title="Add Staff Member"
        description="Create a doctor, nurse, receptionist, lab staff, cashier, or pharmacist record for this hospital."
        action={action}
        hospitalUsers={data.hospitalUsers}
        departments={data.departments}
        submitLabel="Create Staff"
      />
    </div>
  );
}