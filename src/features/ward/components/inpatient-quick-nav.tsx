import Link from "next/link";
import { Activity, ClipboardCheck, CreditCard, FileClock, HeartPulse } from "lucide-react";

import { cn } from "@/lib/utils";

type InpatientQuickNavProps = {
  hospitalSlug: string;
  admissionId: string;
  className?: string;
};

const links = [
  {
    label: "Chart",
    description: "Admission overview",
    icon: Activity,
    getHref: (hospitalSlug: string, admissionId: string) => `/h/${hospitalSlug}/ward/admissions/${admissionId}`,
  },
  {
    label: "Vitals",
    description: "Nursing observations",
    icon: HeartPulse,
    getHref: (hospitalSlug: string, admissionId: string) => `/h/${hospitalSlug}/nurse/admissions/${admissionId}`,
  },
  {
    label: "Checklist",
    description: "Discharge readiness",
    icon: FileClock,
    getHref: (hospitalSlug: string, admissionId: string) => `/h/${hospitalSlug}/ward/admissions/${admissionId}`,
  },
  {
    label: "Billing",
    description: "Invoice status",
    icon: CreditCard,
    getHref: (hospitalSlug: string, admissionId: string) => `/h/${hospitalSlug}/ward/admissions/${admissionId}`,
  },
  {
    label: "Discharge",
    description: "Queue and clearance",
    icon: ClipboardCheck,
    getHref: (hospitalSlug: string, admissionId: string) => `/h/${hospitalSlug}/ward/discharges`,
  },
];

export function InpatientQuickNav({
  hospitalSlug,
  admissionId,
  className,
}: InpatientQuickNavProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-5",
        className
      )}
    >
      {links.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.getHref(hospitalSlug, admissionId)}
            className="group rounded-2xl border border-border/70 bg-background px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-[1px] hover:border-primary/30 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(14,122,145,0.10)] text-primary ring-1 ring-border/60">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
