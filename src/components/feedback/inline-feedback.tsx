import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackTone = "error" | "success" | "info";

type InlineFeedbackProps = {
  message: string;
  tone?: FeedbackTone;
  className?: string;
};

const toneStyles: Record<FeedbackTone, string> = {
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  info:
    "border-border bg-muted/40 text-muted-foreground",
};

const toneIcons: Record<FeedbackTone, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function InlineFeedback({
  message,
  tone = "info",
  className,
}: InlineFeedbackProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        toneStyles[tone],
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="leading-6">{message}</p>
    </div>
  );
}
