import { createClient } from "@/lib/supabase/server";

export type WriteAuditLogInput = {
  hospitalId: string;
  actorUserId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  payload?: Record<string, unknown>;
};

export async function writeAuditLog({
  hospitalId,
  actorUserId = null,
  entityType,
  entityId = null,
  action,
  payload = {},
}: WriteAuditLogInput) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("audit_logs").insert({
      hospital_id: hospitalId,
      actor_user_id: actorUserId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      payload,
    });

    if (error) {
      console.error("Audit log insert failed:", error.message);
    }
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}