import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * WorkspacePageShell - Standardized page composition wrapper for workspace pages.
 * 
 * Provides consistent:
 * - Page-level spacing rhythm
 * - Section stacking patterns
 * - Content density
 * - Responsive behavior
 * 
 * Use this for all top-level workspace pages (frontdesk, doctor, lab, etc.)
 * to create a consistent scanning and navigation experience.
 */
export type WorkspacePageShellProps = {
  children: ReactNode;
  className?: string;
  /** Reduce vertical spacing for denser layouts (e.g., admin pages) */
  dense?: boolean;
  /** Increase vertical spacing for more breathing room (e.g., marketing-style pages) */
  relaxed?: boolean;
};

export function WorkspacePageShell({
  children,
  className,
  dense = false,
  relaxed = false,
}: WorkspacePageShellProps) {
  return (
    <main
      className={cn(
        // Base spacing - consistent with hospital-shell main content area
        "flex-1",
        // Vertical rhythm based on density preference
        dense ? "space-y-4" : relaxed ? "space-y-8" : "space-y-6",
        className
      )}
    >
      {children}
    </main>
  );
}

// ============================================================================
// SECTION COMPOSITION PATTERNS
// ============================================================================

/**
 * WorkspaceStatsStrip - Standardized stats/summary strip for workspace pages.
 * 
 * Standard placement: Immediately after page header
 * Use for: KPIs, summary counts, status overview
 */
export type WorkspaceStatsStripProps = {
  children: ReactNode;
  className?: string;
};

export function WorkspaceStatsStrip({ children, className }: WorkspaceStatsStripProps) {
  return (
    <section
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * WorkspaceFiltersBar - Standardized filters/controls strip.
 * 
 * Standard placement: After stats strip, before main content
 * Use for: Search, filters, view toggles, quick actions
 */
export type WorkspaceFiltersBarProps = {
  children: ReactNode;
  className?: string;
};

export function WorkspaceFiltersBar({ children, className }: WorkspaceFiltersBarProps) {
  return (
    <section className={cn("", className)}>
      {children}
    </section>
  );
}

/**
 * WorkspaceMainContent - Primary content area for workspace pages.
 * 
 * Standard placement: Center/main column of two-column layouts
 * Use for: Queue lists, work items, primary operational content
 */
export type WorkspaceMainContentProps = {
  children: ReactNode;
  className?: string;
};

export function WorkspaceMainContent({ children, className }: WorkspaceMainContentProps) {
  return (
    <div className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}

/**
 * WorkspaceSidePanel - Secondary/supporting content area.
 * 
 * Standard placement: Right column of two-column layouts
 * Use for: Context panels, quick actions, secondary info
 */
export type WorkspaceSidePanelProps = {
  children: ReactNode;
  className?: string;
};

export function WorkspaceSidePanel({ children, className }: WorkspaceSidePanelProps) {
  return (
    <aside className={cn("space-y-4", className)}>
      {children}
    </aside>
  );
}

/**
 * WorkspaceTwoColumnLayout - Standard two-column workspace layout.
 * 
 * Standard use: Queue + Detail, List + Context, etc.
 * Left column is typically wider for main content.
 */
export type WorkspaceTwoColumnLayoutProps = {
  main: ReactNode;
  side: ReactNode;
  className?: string;
  /** Adjust the column ratio (default is roughly 60/40) */
  ratio?: "60-40" | "65-35" | "70-30" | "50-50";
  /** Reverse the column order on desktop (side panel on left) */
  reversed?: boolean;
};

export function WorkspaceTwoColumnLayout({
  main,
  side,
  className,
  ratio = "60-40",
  reversed = false,
}: WorkspaceTwoColumnLayoutProps) {
  const ratioClasses = {
    "60-40": "lg:grid-cols-[1.5fr_1fr]",
    "65-35": "lg:grid-cols-[1.85fr_1fr]",
    "70-30": "lg:grid-cols-[2.15fr_1fr]",
    "50-50": "lg:grid-cols-[1fr_1fr]",
  };

  return (
    <div
      className={cn(
        "grid gap-6",
        ratioClasses[ratio],
        reversed && "lg:grid-flow-dense",
        className
      )}
    >
      <WorkspaceMainContent className={reversed ? "lg:col-start-2" : ""}>
        {main}
      </WorkspaceMainContent>
      <WorkspaceSidePanel className={reversed ? "lg:col-start-1" : ""}>
        {side}
      </WorkspaceSidePanel>
    </div>
  );
}

/**
 * WorkspaceContentStack - Consistent vertical stack for mixed content sections.
 * 
 * Use for: Stacking cards, sections, or content blocks within a column
 */
export type WorkspaceContentStackProps = {
  children: ReactNode;
  className?: string;
  /** Tight spacing for dense content */
  tight?: boolean;
  /** Extra spacing for breathing room */
  loose?: boolean;
};

export function WorkspaceContentStack({
  children,
  className,
  tight = false,
  loose = false,
}: WorkspaceContentStackProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        tight ? "gap-3" : loose ? "gap-6" : "gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * WorkspaceSection - Standardized section wrapper with consistent spacing.
 * 
 * Use for: Card sections, bordered panels, distinct content areas
 */
export type WorkspaceSectionProps = {
  children: ReactNode;
  className?: string;
  /** Add standard border and padding */
  bordered?: boolean;
};

export function WorkspaceSection({
  children,
  className,
  bordered = false,
}: WorkspaceSectionProps) {
  return (
    <section
      className={cn(
        bordered && "rounded-2xl border p-4 sm:p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * WorkspaceDetailLayout - Specialized layout for detail pages.
 * 
 * Tighter rhythm, focused on single entity view with supporting context.
 */
export type WorkspaceDetailLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function WorkspaceDetailLayout({ children, className }: WorkspaceDetailLayoutProps) {
  return (
    <div className={cn("space-y-5", className)}>
      {children}
    </div>
  );
}

/**
 * WorkspaceDetailSplit - Two-column layout optimized for detail pages.
 * 
 * Primary content (left) + supporting context (right)
 */
export type WorkspaceDetailSplitProps = {
  primary: ReactNode;
  supporting: ReactNode;
  className?: string;
};

export function WorkspaceDetailSplit({
  primary,
  supporting,
  className,
}: WorkspaceDetailSplitProps) {
  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-[1.45fr_.95fr]",
        className
      )}
    >
      <div className="space-y-6">
        {primary}
      </div>
      <div className="space-y-6">
        {supporting}
      </div>
    </div>
  );
}
