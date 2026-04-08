import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type WorkspaceStatCardTone = "neutral" | "info" | "success" | "warning" | "danger";

export type WorkspaceStatCardAction = {
  label: string;
  href: string;
};

export type WorkspaceStatCardProps = {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  /** Visual emphasis based on operational meaning */
  tone?: WorkspaceStatCardTone;
  /** Optional action link to related page */
  action?: WorkspaceStatCardAction;
  valueClassName?: string;
  className?: string;
};

const toneStyles: Record<WorkspaceStatCardTone, string> = {
  neutral: "border-border/70 bg-card",
  info: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20",
  success: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20",
  warning: "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20",
  danger: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20",
};

const toneIconStyles: Record<WorkspaceStatCardTone, string> = {
  neutral: "bg-[linear-gradient(135deg,rgba(14,122,145,0.12),rgba(42,179,204,0.16))] text-primary",
  info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const toneValueStyles: Record<WorkspaceStatCardTone, string> = {
  neutral: "text-foreground",
  info: "text-blue-700 dark:text-blue-300",
  success: "text-emerald-700 dark:text-emerald-300",
  warning: "text-amber-700 dark:text-amber-300",
  danger: "text-red-700 dark:text-red-300",
};

/**
 * WorkspaceStatCard - Enhanced stat card with KPI interpretation support
 * 
 * Use for:
 * - Dashboard summary strips
 * - Workspace home page KPIs
 * - Operational metrics with context
 * 
 * Provides:
 * - Clear value display with optional tone-based styling
 * - Interpretive description
 * - Optional action link for next steps
 * 
 * Example:
 * <WorkspaceStatCard
 *   title="Patients Waiting"
 *   value={12}
 *   description="3 emergency, 9 routine"
 *   tone="warning"
 *   action={{ label: "View Queue", href: "/queue" }}
 * />
 */
export function WorkspaceStatCard({
  title,
  value,
  description,
  icon,
  tone = "neutral",
  action,
  valueClassName,
  className,
}: WorkspaceStatCardProps) {
  return (
    <section
      className={cn(
        "group rounded-[1.35rem] border px-5 py-4 shadow-[0_10px_28px_rgba(13,27,42,0.035)] transition-all hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(13,27,42,0.06)]",
        toneStyles[tone],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
          <div
            className={cn(
              "text-[2rem] font-semibold leading-none tracking-[-0.04em]",
              toneValueStyles[tone],
              valueClassName
            )}
          >
            {value}
          </div>
        </div>

        {icon ? (
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-border/70",
            toneIconStyles[tone]
          )}>
            {icon}
          </div>
        ) : null}
      </div>

      {description ? (
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 text-sm"
            asChild
          >
            <Link href={action.href}>
              {action.label}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
