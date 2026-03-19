const featureSections = [
  {
    title: "Front Desk",
    description: "Manage arrivals, registration, appointments, and queue movement with less confusion.",
  },
  {
    title: "Doctor Workspace",
    description: "Move encounters from review to lab, treatment, admission, and completion with clearer context.",
  },
  {
    title: "Laboratory",
    description: "Track orders, enter results, and release completed investigations back into the workflow.",
  },
  {
    title: "Pharmacy",
    description: "Dispense medications, track blocked stock, and keep partial fulfillment visible.",
  },
  {
    title: "Ward & Nursing",
    description: "Monitor admissions, bed status, vitals, discharge readiness, and day-to-day inpatient flow.",
  },
  {
    title: "Billing",
    description: "Record charges, post payments, and keep financial clearance visible before discharge.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="space-y-16 py-12">
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hero-mesh rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]">
          <div className="rounded-[1.52rem] bg-white/92 p-6 dark:bg-[#101c2c]/88 sm:p-8">
            <p className="eyebrow">Features</p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Built around the real hospital workflow
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
              MPG Care Hub connects the major clinical and operational workspaces into one clearer flow.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {featureSections.map((section) => (
          <section
            key={section.title}
            className="surface-panel scroll-mt-32 p-6"
          >
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {section.description}
            </p>
          </section>
        ))}
      </section>
    </main>
  );
}
