type AdminSetupNavProps = {
  hospitalSlug: string;
  current?:
    | "departments"
    | "wards"
    | "beds"
    | "medications"
    | "pharmacy-stock"
    | "lab-tests"
    | "access";
};

const ITEMS = [
  { key: "departments", label: "Departments", href: (slug: string) => `/h/${slug}/admin/departments` },
  { key: "wards", label: "Wards", href: (slug: string) => `/h/${slug}/admin/wards` },
  { key: "beds", label: "Bed Setup", href: (slug: string) => `/h/${slug}/admin/beds` },
  { key: "medications", label: "Medication Setup", href: (slug: string) => `/h/${slug}/admin/medications` },
  { key: "pharmacy-stock", label: "Stock Batches", href: (slug: string) => `/h/${slug}/admin/pharmacy-stock` },
  { key: "lab-tests", label: "Lab Test Catalog", href: (slug: string) => `/h/${slug}/admin/lab-tests` },
  { key: "access", label: "Access Control", href: (slug: string) => `/h/${slug}/admin/access` },
] as const;

export function AdminSetupNav({ hospitalSlug, current }: AdminSetupNavProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border p-3">
      {ITEMS.map((item) => {
        const active = item.key === current;

        return (
          <a
            key={item.key}
            href={item.href(hospitalSlug)}
            className={
              active
                ? "inline-flex items-center rounded-md border border-foreground bg-foreground px-3 py-2 text-sm text-background"
                : "inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
            }
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

