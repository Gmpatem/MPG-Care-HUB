import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type WorkspaceEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function WorkspaceEmptyState({
  title,
  description,
  action,
}: WorkspaceEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-4 py-8">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>

        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
