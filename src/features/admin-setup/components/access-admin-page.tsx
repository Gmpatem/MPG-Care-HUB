"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createHospitalAccessInvitation, type CreateHospitalAccessInvitationState } from "@/features/admin-setup/actions/create-hospital-access-invitation";
import { updateHospitalUserRole } from "@/features/staff/actions/update-hospital-user-role";
import { toggleHospitalUserStatus } from "@/features/staff/actions/toggle-hospital-user-status";
import { updateHospitalUserWorkspaces } from "@/features/staff/actions/update-hospital-user-workspaces";
import { WORKSPACE_KEYS, type WorkspaceKey, getDefaultWorkspacesForRole } from "@/lib/auth/workspaces";
import { AdminSetupNav } from "@/features/admin-setup/components/admin-setup-nav";

const initialInviteState: CreateHospitalAccessInvitationState = {};

const ROLE_OPTIONS = [
  "hospital_admin",
  "receptionist",
  "doctor",
  "nurse",
  "cashier",
] as const;

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatWorkspaceLabel(value: string) {
  switch (value) {
    case "frontdesk":
      return "Front Desk";
    default:
      return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

function RoleUpdateForm({
  hospitalSlug,
  hospitalUserId,
  currentRole,
}: {
  hospitalSlug: string;
  hospitalUserId: string;
  currentRole: string;
}) {
  return (
    <form action={updateHospitalUserRole} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="hospital_slug" value={hospitalSlug} />
      <input type="hidden" name="hospital_user_id" value={hospitalUserId} />
      <select
        name="role"
        defaultValue={currentRole}
        className="rounded-md border px-3 py-2 text-sm"
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline">
        Update Role
      </Button>
    </form>
  );
}

function StatusToggleForm({
  hospitalSlug,
  hospitalUserId,
  currentStatus,
}: {
  hospitalSlug: string;
  hospitalUserId: string;
  currentStatus: string;
}) {
  const nextStatus = currentStatus === "active" ? "inactive" : "active";

  return (
    <form action={toggleHospitalUserStatus}>
      <input type="hidden" name="hospital_slug" value={hospitalSlug} />
      <input type="hidden" name="hospital_user_id" value={hospitalUserId} />
      <input type="hidden" name="next_status" value={nextStatus} />
      <Button type="submit" size="sm" variant="outline">
        Mark {nextStatus}
      </Button>
    </form>
  );
}

function WorkspaceAccessForm({
  hospitalSlug,
  hospitalUserId,
  currentRole,
  extraWorkspaces,
}: {
  hospitalSlug: string;
  hospitalUserId: string;
  currentRole: string;
  extraWorkspaces: string[];
}) {
  const defaultWorkspaces = getDefaultWorkspacesForRole(currentRole as never);
  const currentExtraSet = new Set(extraWorkspaces);

  return (
    <form action={updateHospitalUserWorkspaces} className="space-y-3 rounded-md border p-3">
      <input type="hidden" name="hospital_slug" value={hospitalSlug} />
      <input type="hidden" name="hospital_user_id" value={hospitalUserId} />

      <div>
        <p className="text-sm font-medium">Additional Workspace Access</p>
        <p className="text-xs text-muted-foreground">
          Primary role already grants: {defaultWorkspaces.length > 0 ? defaultWorkspaces.map(formatWorkspaceLabel).join(", ") : "none"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {WORKSPACE_KEYS.map((workspaceKey: WorkspaceKey) => {
          const impliedByRole = defaultWorkspaces.includes(workspaceKey);
          const checked = currentExtraSet.has(workspaceKey);

          return (
            <label
              key={workspaceKey}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                impliedByRole ? "bg-muted/50 opacity-70" : ""
              }`}
            >
              <input
                type="checkbox"
                name="workspace_keys"
                value={workspaceKey}
                defaultChecked={checked}
                disabled={impliedByRole}
              />
              <span>{formatWorkspaceLabel(workspaceKey)}</span>
              {impliedByRole ? (
                <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                  included
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      <Button type="submit" size="sm" variant="outline">
        Save Workspace Access
      </Button>
    </form>
  );
}

export function AccessAdminPage({
  hospitalSlug,
  hospitalName,
  memberships,
  invitations,
}: {
  hospitalSlug: string;
  hospitalName: string;
  memberships: Array<{
    id: string;
    user_id: string;
    role: string;
    status: string;
    joined_at: string | null;
    created_at: string;
    profile: {
      full_name: string | null;
      email: string | null;
    };
    linked_staff: {
      id: string;
      full_name: string;
      staff_type: string;
      active: boolean;
    } | null;
    extra_workspaces: string[];
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    token: string;
    expires_at: string;
    created_at: string;
  }>;
}) {
  const inviteAction = createHospitalAccessInvitation.bind(null, hospitalSlug);
  const [inviteState, inviteFormAction, invitePending] = useActionState(
    inviteAction,
    initialInviteState
  );

  return (
    <main className="space-y-6">
      <div className="space-y-4 rounded-xl border p-5">
        <div>
          <p className="text-sm text-muted-foreground">Admin Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">Access Control & Staff Onboarding</h1>
          <p className="text-sm text-muted-foreground">
            Invite staff, control workspace access, and link staff profiles for {hospitalName}.
          </p>
        </div>

        <AdminSetupNav hospitalSlug={hospitalSlug} current="access" />
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Invite Staff Member</h2>
          <p className="text-sm text-muted-foreground">
            Invite hospital staff by email. You can either send the invitation automatically or generate a link that you can copy and share manually.
          </p>
        </div>

        <form action={inviteFormAction} className="grid gap-4 xl:grid-cols-2">
          {inviteState.error ? (
            <div className="xl:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {inviteState.error}
            </div>
          ) : null}

          {inviteState.success ? (
            <div className="xl:col-span-2 space-y-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
              <div className="font-medium">
                {inviteState.info || "Invitation created successfully."}
              </div>

              {inviteState.inviteUrl ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-emerald-800">
                    Shareable invite link
                  </div>
                  <input
                    readOnly
                    value={inviteState.inviteUrl}
                    className="w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (inviteState.inviteUrl) {
                          await navigator.clipboard.writeText(inviteState.inviteUrl);
                        }
                      }}
                    >
                      Copy Link
                    </Button>

                    <a
                      href={inviteState.inviteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-white/60"
                    >
                      Open Link
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              className="rounded-md border px-3 py-2"
              placeholder="staff@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Role</span>
            <select name="role" className="rounded-md border px-3 py-2" defaultValue="receptionist">
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm xl:col-span-2">
            <span className="font-medium">Delivery Mode</span>
            <select
              name="delivery_mode"
              className="rounded-md border px-3 py-2"
              defaultValue="manual"
            >
              <option value="manual">Generate Invite Link (Copy & Send)</option>
              <option value="automatic">Send Invitation Email Automatically</option>
            </select>
          </label>

          <div className="xl:col-span-2">
            <Button type="submit" disabled={invitePending}>
              {invitePending ? "Creating..." : "Create Invitation"}
            </Button>
          </div>
        </form>

        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Tip: Manual mode always works and generates a copyable invite link. Automatic email requires email provider configuration.
        </div>
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Current Staff Access</h2>
          <p className="text-sm text-muted-foreground">
            These are the user accounts currently attached to this hospital.
          </p>
        </div>

        {memberships.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No hospital users yet.
          </div>
        ) : (
          <div className="space-y-3">
            {memberships.map((membership) => {
              const primaryWorkspaces = getDefaultWorkspacesForRole(membership.role as never);

              return (
                <div key={membership.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium">
                            {membership.profile.full_name || membership.profile.email || "Unnamed user"}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            {membership.role}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              membership.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {membership.status}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Email: {membership.profile.email ?? "—"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Joined: {formatDateTime(membership.joined_at ?? membership.created_at)}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {primaryWorkspaces.map((workspace) => (
                            <span
                              key={`primary-${workspace}`}
                              className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700"
                            >
                              Primary: {formatWorkspaceLabel(workspace)}
                            </span>
                          ))}
                          {membership.extra_workspaces.map((workspace) => (
                            <span
                              key={`extra-${workspace}`}
                              className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700"
                            >
                              Extra: {formatWorkspaceLabel(workspace)}
                            </span>
                          ))}
                          {membership.extra_workspaces.length === 0 ? (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              No additional workspaces
                            </span>
                          ) : null}
                        </div>

                        {membership.linked_staff ? (
                          <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                            Linked staff: {membership.linked_staff.full_name} · {membership.linked_staff.staff_type} · {membership.linked_staff.active ? "active" : "inactive"}
                          </div>
                        ) : (
                          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                            No linked staff record yet. Create one from the staff page and select this hospital user.
                          </div>
                        )}
                      </div>

                      <div className="flex w-full max-w-md flex-col gap-3">
                        <RoleUpdateForm
                          hospitalSlug={hospitalSlug}
                          hospitalUserId={membership.id}
                          currentRole={membership.role}
                        />

                        <StatusToggleForm
                          hospitalSlug={hospitalSlug}
                          hospitalUserId={membership.id}
                          currentStatus={membership.status}
                        />

                        <Button asChild variant="outline" size="sm">
                          <a href={`/h/${hospitalSlug}/staff/new`}>Create Staff Profile</a>
                        </Button>
                      </div>
                    </div>

                    <WorkspaceAccessForm
                      hospitalSlug={hospitalSlug}
                      hospitalUserId={membership.id}
                      currentRole={membership.role}
                      extraWorkspaces={membership.extra_workspaces}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Pending Staff Invitations</h2>
          <p className="text-sm text-muted-foreground">
            These invitations have been created but not yet accepted.
          </p>
        </div>

        {invitations.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No pending or historical invitations yet.
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => {
              const inviteUrl = `/accept-invite?token=${invitation.token}`;

              return (
                <div key={invitation.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{invitation.email}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {invitation.role}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        invitation.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {invitation.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Created: {formatDateTime(invitation.created_at)} · Expires: {formatDateTime(invitation.expires_at)}
                  </p>

                  <div className="mt-3 space-y-2">
                    <input
                      readOnly
                      value={inviteUrl}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          await navigator.clipboard.writeText(inviteUrl);
                        }}
                      >
                        Copy Link
                      </Button>

                      <a
                        href={inviteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                      >
                        Open Link
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

