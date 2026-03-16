import Link from "next/link";

function navClass(isPrimary = false) {
  return [
    "inline-flex items-center rounded-md border px-3 py-2 text-sm transition-colors",
    isPrimary
      ? "bg-foreground text-background border-foreground hover:opacity-90"
      : "bg-background text-foreground hover:bg-muted",
  ].join(" ");
}

export function InpatientQuickNav({
  hospitalSlug,
}: {
  hospitalSlug: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border p-3">
      <Link className={navClass(true)} href={`/h/${hospitalSlug}/ward`}>
        Ward
      </Link>
      <Link className={navClass()} href={`/h/${hospitalSlug}/ward/bed-board`}>
        Bed Board
      </Link>
      <Link className={navClass()} href={`/h/${hospitalSlug}/ward/discharges`}>
        Discharge Queue
      </Link>
      <Link className={navClass()} href={`/h/${hospitalSlug}/census`}>
        Census
      </Link>
      <Link className={navClass()} href={`/h/${hospitalSlug}/nurse`}>
        Nurse
      </Link>
      <Link className={navClass()} href={`/h/${hospitalSlug}`}>
        Dashboard
      </Link>
    </div>
  );
}