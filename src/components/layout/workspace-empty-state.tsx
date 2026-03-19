import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type WorkspaceEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function WorkspaceEmptyState({
  title,
  description,
  action,
  icon,
  className,
}: WorkspaceEmptyStateProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-dashed border-border/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0.96))] shadow-none dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.7),rgba(15,23,42,0.88))]",
        className
      )}
    >
      <CardContent className="flex flex-col items-start gap-4 py-8 sm:py-9">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(14,122,145,0.10)] text-primary ring-1 ring-border/70">
          {icon ?? <Inbox className="h-5 w-5" />}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
