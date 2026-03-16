export function WardWorkflowConfigPage({
  hospitalName,
  configs,
}: {
  hospitalName: string;
  configs: any[];
}) {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Ward workflow configuration</p>
        <h1 className="text-3xl font-semibold tracking-tight">Ward Config</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the configured inpatient workflow patterns for {hospitalName}.
        </p>
      </div>

      {configs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          No ward workflow configs found yet. Seed a default config first.
        </div>
      ) : (
        <div className="space-y-6">
          {configs.map((config) => (
            <section key={config.id} className="rounded-xl border">
              <div className="border-b px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{config.name}</h2>
                  {config.is_default ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      default
                    </span>
                  ) : null}
                  {config.active ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      active
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 px-5 py-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Requires bed assignment:</span> {config.requires_bed_assignment ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Requires admission intake:</span> {config.requires_admission_intake ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Requires nurse discharge clearance:</span> {config.requires_nurse_discharge_clearance ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Allow ward transfer:</span> {config.allow_ward_transfer ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Allow bed transfer:</span> {config.allow_bed_transfer ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Vitals frequency (hours):</span> {config.default_vitals_frequency_hours ?? "—"}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Workflow Steps</h3>

                  {config.ward_workflow_steps?.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      No steps configured for this workflow.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.ward_workflow_steps.map((step: any) => (
                        <div key={step.id} className="rounded-lg border p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                              {step.sort_order}
                            </span>
                            <p className="font-medium">{step.step_name}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                              {step.step_key}
                            </span>
                            {step.required ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                required
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Type: {step.step_type}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}