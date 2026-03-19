import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WorkflowStepCardProps = {
  step: string;
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function WorkflowStepCard({
  step,
  title,
  description,
  icon,
  action,
  className,
}: WorkflowStepCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.96))] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.7),rgba(15,23,42,0.88))]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background ring-1 ring-border/70">
            {icon}
          </div>
        ) : (
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(14,122,145,0.10)] text-primary ring-1 ring-border/60">
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
              {step.replace(/^step\s*/i, "")}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {step}
          </p>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>

          {action ? <div className="pt-1">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
