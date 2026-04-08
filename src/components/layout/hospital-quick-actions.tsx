"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  BedDouble,
  BriefcaseMedical,
  Building2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Keyboard,
  Pill,
  Search,
  Shield,
  Stethoscope,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { WorkspaceKey } from "@/lib/auth/workspaces";
import {
  getFilteredQuickActions,
  type QuickAction,
} from "@/lib/ui/hospital-navigation";

// Icon mapping for quick actions
type IconComponent = React.ComponentType<{ className?: string }>;

const ICON_MAP: Record<string, IconComponent> = {
  UserPlus,
  ClipboardList,
  BriefcaseMedical,
  Users,
  Stethoscope,
  ClipboardCheck,
  FlaskConical,
  Pill,
  CreditCard,
  UserRound,
  BedDouble,
  Building2,
  Shield,
  Activity,
};

function QuickActionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

interface HospitalQuickActionsProps {
  hospitalSlug: string;
  allowedWorkspaces: WorkspaceKey[];
  isPlatformOwner: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HospitalQuickActions({
  hospitalSlug,
  allowedWorkspaces,
  isPlatformOwner,
  open,
  onOpenChange,
}: HospitalQuickActionsProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get filtered actions based on permissions
  const actions = React.useMemo(
    () => getFilteredQuickActions(allowedWorkspaces, isPlatformOwner, hospitalSlug),
    [allowedWorkspaces, isPlatformOwner, hospitalSlug]
  );

  // Filter by search (simple keyword matching for now)
  const filteredActions = React.useMemo(() => {
    if (!searchQuery.trim()) return actions;
    const query = searchQuery.toLowerCase();
    return actions.filter(
      (action) =>
        action.label.toLowerCase().includes(query) ||
        action.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }, [actions, searchQuery]);

  // Group actions by category for display
  const groupedActions = React.useMemo(() => {
    const groups: { label: string; actions: QuickAction[] }[] = [
      { label: "Reception", actions: [] },
      { label: "Clinical", actions: [] },
      { label: "Inpatient", actions: [] },
      { label: "Finance", actions: [] },
      { label: "Administration", actions: [] },
    ];

    for (const action of filteredActions) {
      // Categorize based on workspace
      if (action.workspace === "frontdesk") {
        groups[0].actions.push(action);
      } else if (["doctor", "lab", "pharmacy"].includes(action.workspace)) {
        groups[1].actions.push(action);
      } else if (["nurse", "ward"].includes(action.workspace)) {
        groups[2].actions.push(action);
      } else if (action.workspace === "billing") {
        groups[3].actions.push(action);
      } else {
        groups[4].actions.push(action);
      }
    }

    return groups.filter((g) => g.actions.length > 0);
  }, [filteredActions]);

  // Keyboard shortcut handler
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
      // Escape to close is handled by Dialog
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Actions</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="border-b px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 border-0 pl-9 pr-20 shadow-none focus-visible:ring-0"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground sm:inline-block">
                <Keyboard className="mr-1 inline h-3 w-3" />
                ESC
              </kbd>
            </div>
          </div>
        </div>

        {/* Actions List */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredActions.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No actions found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a different search term
              </p>
            </div>
          ) : searchQuery ? (
            // Flat list when searching
            <div className="px-2">
              {filteredActions.map((action) => (
                <QuickActionItem
                  key={action.id}
                  action={action}
                  onSelect={() => onOpenChange(false)}
                />
              ))}
            </div>
          ) : (
            // Grouped list when not searching
            <div className="space-y-4 px-2 py-2">
              {groupedActions.map((group) => (
                <div key={group.label}>
                  <h3 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </h3>
                  <div className="space-y-0.5">
                    {group.actions.map((action) => (
                      <QuickActionItem
                        key={action.id}
                        action={action}
                        onSelect={() => onOpenChange(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with keyboard hint */}
        <div className="border-t bg-muted/30 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filteredActions.length} actions available</span>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">
                <kbd className="rounded border bg-background px-1.5 py-0.5">↑↓</kbd> to navigate
              </span>
              <span className="hidden sm:inline">
                <kbd className="rounded border bg-background px-1.5 py-0.5">↵</kbd> to select
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickActionItem({
  action,
  onSelect,
}: {
  action: QuickAction;
  onSelect: () => void;
}) {
  return (
    <Link
      href={action.href}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm",
        "transition-colors hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <QuickActionIcon name={action.icon} className="h-4 w-4" />
      </div>
      <span className="flex-1 font-medium">{action.label}</span>
    </Link>
  );
}

// Trigger button for the quick actions
interface QuickActionsTriggerProps {
  onClick: () => void;
  className?: string;
}

export function QuickActionsTrigger({ onClick, className }: QuickActionsTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn("gap-2 text-muted-foreground", className)}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Quick Actions</span>
      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-xs font-medium lg:inline-block">
        ⌘K
      </kbd>
    </Button>
  );
}
