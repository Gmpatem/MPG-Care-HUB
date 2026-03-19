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
        "hero-mesh rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]",
        className
      )}
    >
      <div className="rounded-[1.52rem] bg-white/92 p-5 dark:bg-[#101c2c]/88 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-2">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}

            <h1 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[2.1rem]">
              {title}
            </h1>

            {description ? (
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex flex-wrap items-center gap-2 xl:max-w-[42rem] xl:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
