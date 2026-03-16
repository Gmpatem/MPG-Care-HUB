import type { ReactNode } from "react";

type WorkflowStepCardProps = {
  step: string;
  title: string;
  description: string;
  icon?: ReactNode;
};

export function WorkflowStepCard({
  step,
  title,
  description,
  icon,
}: WorkflowStepCardProps) {
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 rounded-lg bg-background p-2 ring-1 ring-border">
            {icon}
          </div>
        ) : null}

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {step}
          </p>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
