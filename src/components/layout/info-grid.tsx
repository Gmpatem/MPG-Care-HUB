import { cn } from "@/lib/utils";

type InfoGridItem = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

type InfoGridProps = {
  items: InfoGridItem[];
  columnsClassName?: string;
  className?: string;
};

export function InfoGrid({
  items,
  columnsClassName = "md:grid-cols-2 xl:grid-cols-4",
  className,
}: InfoGridProps) {
  return (
    <div className={cn("grid gap-3", columnsClassName, className)}>
      {items.map((item) => (
        <div
          key={`${item.label}-${String(item.value ?? "—")}`}
          className={cn(
            "rounded-2xl border border-border/70 bg-background/70 p-3",
            item.className
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {item.value === null || item.value === undefined || item.value === ""
              ? "—"
              : String(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
