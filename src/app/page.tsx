import Link from "next/link";
import {
  Activity,
  Building2,
  CreditCard,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Users,
  ArrowRight,
  HeartPulse,
  Clock,
  CheckCircle2,
  LayoutGrid,
  Search,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Front Desk & Intake",
    body: "Register patients, search records, route arrivals, and keep queue movement clean from the first click.",
    icon: Users,
    color: "from-[#0e7a91] to-[#2ab3cc]",
    bgGlow: "bg-[#2ab3cc]/10",
  },
  {
    title: "Doctor Workflow",
    body: "Move from consultation to investigations, prescriptions, admissions, and final clinical decisions in one flow.",
    icon: Stethoscope,
    color: "from-[#1196b0] to-[#6ccfe0]",
    bgGlow: "bg-[#1196b0]/10",
  },
  {
    title: "Laboratory & Pharmacy",
    body: "Run result-entry and medication dispensing on operational pages instead of scattered admin forms.",
    icon: FlaskConical,
    color: "from-[#1e8a52] to-[#34a86b]",
    bgGlow: "bg-[#1e8a52]/10",
  },
  {
    title: "Billing & Clearance",
    body: "Create invoices, post payments, and expose financial clearance for discharge without guesswork.",
    icon: CreditCard,
    color: "from-[#c47e10] to-[#e5a330]",
    bgGlow: "bg-[#c47e10]/10",
  },
];

const stats = [
  { label: "Active Admissions", value: "18", change: "+2 today", color: "text-[#1196b0]", bg: "bg-[#1196b0]/10", border: "border-[#1196b0]/20" },
  { label: "Discharge Queue", value: "5", change: "Awaiting clearance", color: "text-[#c47e10]", bg: "bg-[#c47e10]/10", border: "border-[#c47e10]/20" },
  { label: "Available Beds", value: "7", change: "Across 3 wards", color: "text-[#1e8a52]", bg: "bg-[#1e8a52]/10", border: "border-[#1e8a52]/20" },
  { label: "Vitals Overdue", value: "3", change: "Urgent attention", color: "text-[#e03620]", bg: "bg-[#e03620]/10", border: "border-[#e03620]/20" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#eef5ff] text-[#0d1b2a] dark:bg-[#080f1a] dark:text-[#e8f2fa] transition-colors duration-300">

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101c2c]/80 backdrop-blur-md border-b border-[#c8ddef] dark:border-white/8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] text-white shadow-lg shadow-[#0e7a91]/20">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">MPG Care Hub</p>
              <p className="text-xs text-[#6a87a0] dark:text-[#9ab0c4]">Hospital Operations System</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#f4f8fd] dark:bg-white/5 border border-[#c8ddef] dark:border-white/10 rounded-lg px-3 py-2 cursor-pointer hover:border-[#2ab3cc] transition-colors">
            <Search className="h-4 w-4 text-[#6a87a0]" />
            <span className="text-sm text-[#6a87a0]">Search patients, actions...</span>
            <kbd className="ml-2 text-[10px] font-mono px-1.5 py-0.5 bg-white dark:bg-white/10 border border-[#c8ddef] dark:border-white/10 rounded text-[#6a87a0]">
              ⌘K
            </kbd>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-[#c8ddef] dark:border-white/10 hover:bg-[#e3effd] dark:hover:bg-white/5">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-[#1196b0] hover:bg-[#0e7a91] text-white shadow-lg shadow-[#1196b0]/25">
              <Link href="/platform">Platform Console</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Mesh Gradient */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b2a4a] via-[#0b4a5c] to-[#0d6175] shadow-2xl shadow-[#0b2a4a]/20">

          {/* Mesh Gradient Overlay */}
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#2ab3cc]/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#534ab7]/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#1e8a52]/10 blur-3xl" />
          </div>

          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}
          />

          <div className="relative px-8 py-16 md:px-12 md:py-20">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">

              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6ccfe0]">
                    Clinical Operations Platform
                  </p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
                    One hospital workspace for{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6ccfe0] to-[#a8e5ef]">
                      every role
                    </span>
                  </h1>
                  <p className="text-lg text-white/70 max-w-xl leading-relaxed">
                    MPG Care Hub coordinates intake, clinical decisions, investigations,
                    inpatient care, and billing in one unified system. Built for real
                    healthcare workflow movement.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-white text-[#0b2a4a] hover:bg-[#eef5ff] shadow-xl shadow-black/10 group">
                    <Link href="/login" className="gap-2">
                      Open Workspace
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
                    <Link href="/platform">Platform Console</Link>
                  </Button>
                </div>

                {/* Live Stats Row */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                    <p className="text-2xl font-mono font-semibold text-white">24/7</p>
                    <p className="text-xs text-white/50 mt-1">Live Operations</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                    <p className="text-2xl font-mono font-semibold text-[#6ccfe0]">Multi</p>
                    <p className="text-xs text-white/50 mt-1">Tenant Ready</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                    <p className="text-2xl font-mono font-semibold text-[#a8e5ef]">Role</p>
                    <p className="text-xs text-white/50 mt-1">Based Access</p>
                  </div>
                </div>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="group relative rounded-2xl bg-white/10 border border-white/10 p-6 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{feature.body}</p>

                      {/* Hover Glow Effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl -z-10`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Operational Dashboard Style */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-xl border ${stat.border} ${stat.bg} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${stat.color.replace('text-', 'bg-')}`} />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6a87a0] dark:text-[#9ab0c4] mb-2">
                {stat.label}
              </p>
              <p className={`text-3xl font-mono font-semibold ${stat.color} tracking-tight`}>
                {stat.value}
              </p>
              <p className="text-xs text-[#6a87a0] dark:text-[#9ab0c4] mt-1">{stat.change}</p>

              {/* Progress bar for visual flair */}
              <div className="mt-3 h-1 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.color.replace('text-', 'bg-')} rounded-full`}
                  style={{ width: `${Math.min(parseInt(stat.value) * 10 + 20, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Content Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">

          {/* Main Content Card */}
          <div className="rounded-2xl bg-white dark:bg-[#101c2c] border border-[#c8ddef] dark:border-white/8 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid className="h-4 w-4 text-[#1196b0]" />
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1196b0]">
                What it solves
              </p>
            </div>

            <h3 className="text-2xl font-semibold tracking-tight mb-3">
              Hospital software should feel like an operations room,{" "}
              <span className="text-[#6a87a0]">not a spreadsheet wearing a lab coat.</span>
            </h3>

            <p className="text-[#3a5068] dark:text-[#9ab0c4] leading-relaxed mb-8">
              The visual system reduces grayscale fatigue, clarifies surface hierarchy, and gives
              each workspace a stronger identity. It borrows the operational character of clinical
              interfaces without compromising on modern usability standards.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Activity, title: "Clear hierarchy", desc: "Important actions stand out faster" },
                { icon: ShieldCheck, title: "Safer workflows", desc: "Queue pages feel operational" },
                { icon: Building2, title: "Consistent shell", desc: "Less repetition, more focus" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-[#f4f8fd] dark:bg-white/5 border border-[#c8ddef] dark:border-white/8 p-4 hover:border-[#2ab3cc] dark:hover:border-[#2ab3cc]/50 transition-colors">
                  <item.icon className="h-5 w-5 text-[#1196b0] mb-3" />
                  <p className="font-medium text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-[#6a87a0] dark:text-[#9ab0c4]">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#c8ddef] dark:border-white/8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] border-2 border-white dark:border-[#101c2c] flex items-center justify-center text-[10px] font-semibold text-white">
                        {['ST', 'DR', 'NK'][i-1]}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Trusted by clinical staff</p>
                    <p className="text-xs text-[#6a87a0]">Nurses, Doctors, Admins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1e8a52]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">HIPAA Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Launch Points Card */}
          <div className="rounded-2xl bg-white dark:bg-[#101c2c] border border-[#c8ddef] dark:border-white/8 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Command className="h-4 w-4 text-[#1196b0]" />
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1196b0]">
                Launch Points
              </p>
            </div>

            <h3 className="text-2xl font-semibold tracking-tight mb-2">Start where you work.</h3>
            <p className="text-sm text-[#6a87a0] dark:text-[#9ab0c4] mb-6">
              Quick access to primary workflows
            </p>

            <div className="space-y-3">
              <Button asChild className="w-full justify-between bg-[#1196b0] hover:bg-[#0e7a91] text-white group h-12">
                <Link href="/login">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Sign in to hospital workspace
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-between border-[#c8ddef] dark:border-white/10 hover:bg-[#e3effd] dark:hover:bg-white/5 h-12">
                <Link href="/platform">
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Open platform administration
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-between border-[#c8ddef] dark:border-white/10 hover:bg-[#e3effd] dark:hover:bg-white/5 h-12">
                <Link href="/onboarding/create-facility">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Create a facility
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-[#f4f8fd] dark:bg-white/5 border border-[#c8ddef] dark:border-white/8">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#c47e10] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#c47e10]">System Status</p>
                  <p className="text-xs text-[#6a87a0] dark:text-[#9ab0c4] mt-1">
                    All services operational. Last updated: 2 mins ago.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#c8ddef] dark:border-white/8 bg-white dark:bg-[#0c1520] mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] flex items-center justify-center text-white text-xs font-bold">
                M
              </div>
              <span className="text-sm font-medium">MPG Care Hub</span>
            </div>
            <p className="text-xs text-[#6a87a0] dark:text-[#9ab0c4]">
              © 2026 MPG Care Hub. Built for healthcare operations.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
