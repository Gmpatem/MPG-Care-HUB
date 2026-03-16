import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WorkspacePageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: WorkspacePageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.6rem] border border-[#7db8d3] bg-[linear-gradient(135deg,rgba(11,42,74,0.06),rgba(42,179,204,0.06))] p-5 shadow-[0_18px_48px_rgba(13,27,42,0.05)] sm:p-6",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(42,179,204,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(83,74,183,0.08),transparent_30%)]" />
      <div className="relative grid gap-5 xl:grid-cols-[1.15fr_.85fr] xl:items-center">
        <div className="space-y-2">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}

          <div className="space-y-2">
            <h1 className="text-[1.95rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[2.2rem]">
              {title}
            </h1>

            {description ? (
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
