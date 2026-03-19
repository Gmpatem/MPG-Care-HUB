export default function HospitalWorkspaceLoading() {
  return (
    <main className="space-y-6 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      <section className="hero-mesh rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]">
        <div className="rounded-[1.52rem] bg-white/92 p-5 dark:bg-[#101c2c]/88 sm:p-6">
          <div className="space-y-3">
            <div className="h-4 w-36 animate-pulse rounded-full bg-muted" />
            <div className="h-9 w-72 animate-pulse rounded-xl bg-muted" />
            <div className="h-4 max-w-2xl animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-[85%] max-w-3xl animate-pulse rounded-full bg-muted" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <div className="h-10 w-36 animate-pulse rounded-xl bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[1.35rem] border border-border/70 bg-card"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_.95fr]">
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-[1.5rem] border border-border/70 bg-card" />
          <div className="h-80 animate-pulse rounded-[1.5rem] border border-border/70 bg-card" />
        </div>

        <div className="space-y-6">
          <div className="h-52 animate-pulse rounded-[1.5rem] border border-border/70 bg-card" />
          <div className="h-72 animate-pulse rounded-[1.5rem] border border-border/70 bg-card" />
        </div>
      </div>
    </main>
  );
}
