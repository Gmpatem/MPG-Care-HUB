import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WorkspaceSectionHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function WorkspaceSectionHeader({
  title,
  description,
  actions,
  className,
}: WorkspaceSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-[1.45rem] font-semibold tracking-[-0.025em] text-foreground">
          {title}
        </h2>

        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
