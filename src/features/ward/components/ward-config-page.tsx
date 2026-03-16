import Link from "next/link";
import { Button } from "@/components/ui/button";

function boolTone(value: boolean) {
  return value
    ? "bg-emerald-100 text-emerald-700"
    : "bg-slate-100 text-slate-700";
}

function formatCurrency(value: number | null) {
  const amount = Number(value ?? 0);
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function RuleChip({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${boolTone(enabled)}`}>
      {label}: {enabled ? "yes" : "no"}
    </span>
  );
}

function WorkflowConfigCard({
  config,
}: {
  config: any;
}) {
  const steps = Array.isArray(config.steps) ? config.steps : [];
  const checklistItems = Array.isArray(config.discharge_checklists)
    ? config.discharge_checklists
    : [];

  return (
    <div
      className={`rounded-xl border p-5 ${
        config.is_default ? "border-blue-200 bg-blue-50/30" : ""
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{config.name}</h2>

            {config.is_default ? (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                default
              </span>
            ) : null}

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                config.active
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {config.active ? "active" : "inactive"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <RuleChip label="Bed assignment" enabled={config.requires_bed_assignment} />
            <RuleChip label="Admission intake" enabled={config.requires_admission_intake} />
            <RuleChip
              label="Nurse discharge clearance"
              enabled={config.requires_nurse_discharge_clearance}
            />
            <RuleChip label="Ward transfer" enabled={config.allow_ward_transfer} />
            <RuleChip label="Bed transfer" enabled={config.allow_bed_transfer} />
          </div>

          <p className="text-sm text-muted-foreground">
            Default vitals frequency:{" "}
            {config.default_vitals_frequency_hours
              ? `${config.default_vitals_frequency_hours} hour(s)`
              : "not set"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Workflow Steps</h3>
            <p className="text-sm text-muted-foreground">
              Ordered inpatient steps configured for this workflow.
            </p>
          </div>

          {steps.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              No workflow steps configured.
            </div>
          ) : (
            <div className="space-y-2">
              {steps.map((step: any) => (
                <div key={step.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      #{step.sort_order}
                    </span>
                    <span className="font-medium">{step.step_name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {step.step_type}
                    </span>
                    {step.required ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        required
                      </span>
                    ) : null}
                    {!step.active ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        inactive
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Key: {step.step_key}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Discharge Checklist</h3>
            <p className="text-sm text-muted-foreground">
              Checklist items tied to this workflow before discharge completion.
            </p>
          </div>

          {checklistItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              No discharge checklist items configured.
            </div>
          ) : (
            <div className="space-y-2">
              {checklistItems.map((item: any) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      #{item.sort_order}
                    </span>
                    <span className="font-medium">{item.item_label}</span>
                    {item.required ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        required
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        optional
                      </span>
                    )}
                    {!item.active ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        inactive
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Key: {item.item_key}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WardListSection({
  wards,
}: {
  wards: any[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Ward Setup</h2>
        <p className="text-sm text-muted-foreground">
          Ward definitions currently available for admissions and inpatient routing.
        </p>
      </div>

      {wards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No wards have been configured yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wards.map((ward) => (
            <div key={ward.id} className="rounded-xl border p-4">
              <div className="space-y-1">
                <h3 className="font-medium">{ward.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {ward.code ?? "No code"} · {ward.ward_type ?? "general"}
                </p>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <p>Status: {ward.active ? "active" : "inactive"}</p>
                <p>Admission fee: {formatCurrency(ward.admission_fee)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function WardConfigPage({
  hospitalSlug,
  hospitalName,
  configs,
  wards,
  stats,
}: {
  hospitalSlug: string;
  hospitalName: string;
  configs: any[];
  wards: any[];
  stats: {
    total_configs: number;
    active_configs: number;
    default_configs: number;
    total_steps: number;
    total_checklist_items: number;
    total_wards: number;
    active_wards: number;
  };
}) {
  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Ward Configuration</p>
          <h1 className="text-3xl font-semibold tracking-tight">Ward Config</h1>
          <p className="text-sm text-muted-foreground">
            Review inpatient workflow rules, discharge checklist setup, and ward definitions for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/ward`}>Open Ward</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/admissions`}>Admission Intake</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Workflow Configs</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_configs}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active Configs</p>
          <div className="mt-2 text-2xl font-semibold">{stats.active_configs}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Default Configs</p>
          <div className="mt-2 text-2xl font-semibold">{stats.default_configs}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Workflow Steps</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_steps}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Checklist Items</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_checklist_items}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Wards</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_wards}</div>
        </div>
      </div>

      {configs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No ward workflow configs found yet.
        </div>
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Workflow Configurations</h2>
            <p className="text-sm text-muted-foreground">
              These configs define how admission, transfer, vitals rhythm, and discharge flow through the ward.
            </p>
          </div>

          <div className="space-y-4">
            {configs.map((config) => (
              <WorkflowConfigCard key={config.id} config={config} />
            ))}
          </div>
        </section>
      )}

      <WardListSection wards={wards} />

      <div className="rounded-xl border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Next step note</p>
        <p className="mt-1">
          This page is now ready as an operational reference page. The next safe upgrade would be adding create and edit tools for workflow configs, steps, and discharge checklist items without changing the existing admission and discharge flow.
        </p>
      </div>
    </main>
  );
}