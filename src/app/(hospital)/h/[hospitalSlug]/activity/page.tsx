import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

type AuditRow = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  payload: Record<string, unknown> | null;
  actor_user_id: string | null;
  created_at: string;
};

export default async function HospitalActivityPage({ params }: PageProps) {
  const { hospitalSlug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/h/${hospitalSlug}/activity`)}`);
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) notFound();

  const { data: events, error } = await supabase
    .from("audit_logs")
    .select("id, entity_type, entity_id, action, payload, actor_user_id, created_at")
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const eventRows = (events ?? []) as AuditRow[];

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Activity</p>
        <h1 className="text-3xl font-bold">Hospital Activity Feed</h1>
        <p className="text-muted-foreground">{hospital.name}</p>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-5 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Time</div>
          <div>Action</div>
          <div>Entity Type</div>
          <div>Actor User</div>
          <div>Payload</div>
        </div>

        {eventRows.length > 0 ? (
          eventRows.map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-5 gap-4 border-b px-4 py-3 text-sm last:border-b-0"
            >
              <div>{new Date(event.created_at).toLocaleString()}</div>
              <div className="font-medium">{event.action}</div>
              <div>{event.entity_type}</div>
              <div>{event.actor_user_id ?? "-"}</div>
              <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
                {event.payload ? JSON.stringify(event.payload) : "-"}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-sm text-muted-foreground">
            No activity logged yet.
          </div>
        )}
      </div>
    </main>
  );
}
