import { getEditStaffFormData } from "@/features/staff/server/get-edit-staff-form-data";
import { StaffForm } from "@/features/staff/components/staff-form";
import { updateStaff } from "@/features/staff/actions/update-staff";

type PageProps = {
  params: Promise<{ hospitalSlug: string; staffId: string }>;
};

export default async function EditStaffPage({ params }: PageProps) {
  const { hospitalSlug, staffId } = await params;
  const data = await getEditStaffFormData(hospitalSlug, staffId);

  const action = updateStaff.bind(null, data.hospital.slug, data.staff.id);

  return (
    <div className="max-w-4xl">
      <StaffForm
        title="Edit Staff Member"
        description="Update the staff record, assignment, contact details, and workflow role."
        action={action}
        hospitalUsers={data.hospitalUsers}
        departments={data.departments}
        initialValues={data.staff}
        submitLabel="Save Changes"
      />
    </div>
  );
}