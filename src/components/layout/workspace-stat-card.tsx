import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WorkspaceStatCardProps = {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  valueClassName?: string;
  className?: string;
};

export function WorkspaceStatCard({
  title,
  value,
  description,
  icon,
  valueClassName,
  className,
}: WorkspaceStatCardProps) {
  return (
    <section
      className={cn(
        "group rounded-[1.35rem] border border-border/70 bg-card px-5 py-4 shadow-[0_10px_28px_rgba(13,27,42,0.035)] transition-all hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(13,27,42,0.06)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
          <div
            className={cn(
              "text-[2rem] font-semibold leading-none tracking-[-0.04em] text-foreground",
              valueClassName
            )}
          >
            {value}
          </div>
        </div>

        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(14,122,145,0.12),rgba(42,179,204,0.16))] text-primary ring-1 ring-border/70">
            {icon}
          </div>
        ) : null}
      </div>

      {description ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </section>
  );
}
