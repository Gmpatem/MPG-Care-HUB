import { StatusBadge } from "@/components/layout/status-badge";
import { InfoGrid } from "@/components/layout/info-grid";

type PatientSummaryPanelProps = {
  name: string;
  patientNumber?: string | null;
  subtitle?: string | null;
  statusLabel?: string | null;
  statusTone?: "neutral" | "info" | "success" | "warning" | "danger";
  primaryItems: Array<{
    label: string;
    value: string | number | null | undefined;
  }>;
  secondaryItems?: Array<{
    label: string;
    value: string | number | null | undefined;
  }>;
};

export function PatientSummaryPanel({
  name,
  patientNumber,
  subtitle,
  statusLabel,
  statusTone = "neutral",
  primaryItems,
  secondaryItems = [],
}: PatientSummaryPanelProps) {
  return (
    <section className="surface-panel p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{name}</h3>
            {statusLabel ? (
              <StatusBadge
                label={statusLabel}
                tone={statusTone}
                className="px-2.5 py-1 font-medium"
              />
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">
            {patientNumber || "No patient number"}
            {subtitle ? ` · ${subtitle}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <InfoGrid items={primaryItems} columnsClassName="md:grid-cols-2 xl:grid-cols-4" />
        {secondaryItems.length > 0 ? (
          <InfoGrid items={secondaryItems} columnsClassName="md:grid-cols-2 xl:grid-cols-4" />
        ) : null}
      </div>
    </section>
  );
}
