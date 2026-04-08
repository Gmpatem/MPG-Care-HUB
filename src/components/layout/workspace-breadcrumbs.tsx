import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type WorkspaceBreadcrumbsProps = {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  homeLabel?: string;
  className?: string;
};

/**
 * Compact breadcrumb navigation for workspace pages.
 * Use conservatively - only where hierarchy is clear and helpful.
 */
export function WorkspaceBreadcrumbs({
  items,
  showHome = true,
  homeHref,
  homeLabel = "Dashboard",
  className,
}: WorkspaceBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted-foreground",
        className
      )}
    >
      {showHome && homeHref && (
        <>
          <Link
            href={homeHref}
            className="hover:text-foreground transition-colors"
          >
            {homeLabel}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast && "text-foreground font-medium truncate max-w-[200px] sm:max-w-[300px]"
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
          </div>
        );
      })}
    </nav>
  );
}

export type BackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

/**
 * Simple back/up link for detail pages where full breadcrumbs are too heavy.
 * Preferred over breadcrumbs for simple parent-child navigation.
 */
export function BackLink({ href, label = "Back", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

export type PageIdentityProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backLink?: BackLinkProps;
  className?: string;
};

/**
 * Standardized page identity block for consistent page orientation.
 * Supports both breadcrumb and back-link navigation patterns.
 */
export function PageIdentity({
  eyebrow,
  title,
  description,
  meta,
  breadcrumbs,
  backLink,
  className,
}: PageIdentityProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Navigation */}
      {backLink && <BackLink {...backLink} />}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <WorkspaceBreadcrumbs items={breadcrumbs} showHome={false} />
      )}

      {/* Identity */}
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        )}
        {meta && <div className="pt-1">{meta}</div>}
      </div>
    </div>
  );
}
