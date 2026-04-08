import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type RowActionsProps = {
  /** Primary action - most important next step */
  primary?: RowAction;
  /** Secondary actions - shown as buttons alongside primary */
  secondary?: RowAction[];
  /** Overflow actions - shown in dropdown menu */
  overflow?: RowAction[];
  /** Size variant */
  size?: "sm" | "default";
  /** Alignment */
  align?: "left" | "right";
  className?: string;
};

/**
 * RowActions - Consistent action buttons for list/table rows
 * 
 * Use for:
 * - Queue item actions (Open, Continue, Review)
 * - Table row actions (Edit, View, Delete)
 * - List item actions (Dispense, Record Payment, etc.)
 * 
 * Pattern:
 * - Primary action: main next step (always visible)
 * - Secondary actions: 0-2 additional common actions
 * - Overflow: less common actions in dropdown
 */
export function RowActions({
  primary,
  secondary = [],
  overflow = [],
  size = "sm",
  align = "right",
  className,
}: RowActionsProps) {
  const hasOverflow = overflow.length > 0;
  const hasActions = primary || secondary.length > 0 || hasOverflow;

  if (!hasActions) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        align === "right" && "justify-end",
        className
      )}
    >
      {/* Overflow menu first if aligned right */}
      {hasOverflow && align === "right" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={size} className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflow.map((action, index) => (
              <DropdownMenuItem
                key={index}
                disabled={action.disabled}
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? (
                  <Link href={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </Link>
                ) : (
                  <span className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Secondary actions */}
      {secondary.map((action, index) => (
        <RowActionButton key={index} action={action} size={size} />
      ))}

      {/* Primary action */}
      {primary && <RowActionButton action={primary} size={size} isPrimary />}

      {/* Overflow menu last if aligned left */}
      {hasOverflow && align === "left" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={size} className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {overflow.map((action, index) => (
              <DropdownMenuItem
                key={index}
                disabled={action.disabled}
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? (
                  <Link href={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </Link>
                ) : (
                  <span className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function RowActionButton({
  action,
  size,
  isPrimary = false,
}: {
  action: RowAction;
  size: "sm" | "default";
  isPrimary?: boolean;
}) {
  const variant = action.variant ?? (isPrimary ? "default" : "outline");

  if (action.href) {
    return (
      <Link
        href={action.href}
        className={cn(
          buttonVariants({ variant, size }),
          "gap-1"
        )}
      >
        {action.label}
        {isPrimary && <ChevronRight className="h-3.5 w-3.5" />}
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={action.onClick}
      disabled={action.disabled}
      className="gap-1"
    >
      {action.label}
      {isPrimary && <ChevronRight className="h-3.5 w-3.5" />}
    </Button>
  );
}

/**
 * Simplified row actions for common patterns
 */
export function SimpleRowActions({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  size = "sm",
  className,
}: {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {secondaryHref && (
        <Button variant="outline" size={size} asChild>
          <Link href={secondaryHref}>{secondaryLabel ?? "View"}</Link>
        </Button>
      )}
      <Button size={size} asChild>
        <Link href={primaryHref} className="gap-1">
          {primaryLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
