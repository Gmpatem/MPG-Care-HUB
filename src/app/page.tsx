import Link from "next/link";
import {
  Activity,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  ShieldCheck,
  Stethoscope,
  Users,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Zap,
  Globe,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Front Desk & Intake",
    description: "Eliminate registration bottlenecks with smart routing and real-time queue management.",
    icon: Users,
    stat: "3x faster",
    statLabel: "Patient processing",
    color: "from-[#0e7a91] to-[#2ab3cc]",
    lightColor: "bg-[#2ab3cc]/10",
  },
  {
    title: "Clinical Workflow",
    description: "Doctors move seamlessly from consultation to prescription to admission in one unified flow.",
    icon: Stethoscope,
    stat: "40% less",
    statLabel: "Documentation time",
    color: "from-[#1196b0] to-[#6ccfe0]",
    lightColor: "bg-[#1196b0]/10",
  },
  {
    title: "Lab & Pharmacy",
    description: "Integrated result entry and medication dispensing that actually talks to billing.",
    icon: FlaskConical,
    stat: "Zero",
    statLabel: "Lost prescriptions",
    color: "from-[#1e8a52] to-[#34a86b]",
    lightColor: "bg-[#1e8a52]/10",
  },
  {
    title: "Billing & Revenue",
    description: "Transparent invoicing, multi-modal payments, and automated clearance workflows.",
    icon: CreditCard,
    stat: "98%",
    statLabel: "Collection rate",
    color: "from-[#c47e10] to-[#e5a330]",
    lightColor: "bg-[#c47e10]/10",
  },
];

const testimonials = [
  {
    quote: "We reduced patient wait times by 60% in the first month. The workflow actually matches how we work.",
    author: "Dr. Sarah Chen",
    role: "Medical Director, Metro General",
    avatar: "SC",
    color: "from-[#0e7a91] to-[#2ab3cc]",
  },
  {
    quote: "Finally, a system where front desk, nurses, and doctors see the same patient story in real-time.",
    author: "James Oduya",
    role: "Hospital Administrator, Nairobi Care",
    avatar: "JO",
    color: "from-[#1e8a52] to-[#34a86b]",
  },
  {
    quote: "Revenue leakage dropped significantly once billing became part of the clinical workflow, not an afterthought.",
    author: "Maria Santos",
    role: "CFO, Pacific Medical Group",
    avatar: "MS",
    color: "from-[#c47e10] to-[#e5a330]",
  },
];

const trustLogos = [
  "Metro General",
  "Nairobi Care",
  "Pacific Medical",
  "St. Mary's",
  "City Health",
  "Royal Clinic",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#eef5ff] text-[#0d1b2a] dark:bg-[#080f1a] dark:text-[#e8f2fa]">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#101c2c]/80 backdrop-blur-md border-b border-[#c8ddef] dark:border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] text-white shadow-lg shadow-[#0e7a91]/20">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">MPG Care Hub</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-[#3a5068] dark:text-[#9ab0c4] hover:text-[#1196b0] transition-colors">Features</Link>
              <Link href="#workflow" className="text-sm font-medium text-[#3a5068] dark:text-[#9ab0c4] hover:text-[#1196b0] transition-colors">Workflow</Link>
              <Link href="#testimonials" className="text-sm font-medium text-[#3a5068] dark:text-[#9ab0c4] hover:text-[#1196b0] transition-colors">Testimonials</Link>
              <Link href="#pricing" className="text-sm font-medium text-[#3a5068] dark:text-[#9ab0c4] hover:text-[#1196b0] transition-colors">Pricing</Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hidden sm:flex text-[#3a5068] dark:text-[#9ab0c4] hover:text-[#1196b0]">
                Watch Demo
              </Button>
              <Button asChild className="bg-[#1196b0] hover:bg-[#0e7a91] text-white shadow-lg shadow-[#1196b0]/25">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2ab3cc]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#534ab7]/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1196b0]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 border border-[#c8ddef] dark:border-white/10 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-[#1e8a52] animate-pulse" />
                <span className="text-sm font-medium text-[#3a5068] dark:text-[#9ab0c4]">Now serving 50+ hospitals across Africa</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Hospital operations{" "}
                <span className="relative">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#0e7a91] to-[#2ab3cc]">
                    that actually flow
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#2ab3cc]/30" viewBox="0 0 300 12" preserveAspectRatio="none">
                    <path d="M0,8 Q150,0 300,8" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-[#3a5068] dark:text-[#9ab0c4] leading-relaxed max-w-xl">
                One unified platform connecting front desk, doctors, lab, pharmacy, and billing.
                No more data silos. No more patients falling through cracks.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-[#1196b0] hover:bg-[#0e7a91] text-white shadow-xl shadow-[#1196b0]/30 h-14 px-8 text-lg group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-[#c8ddef] dark:border-white/10 h-14 px-8 text-lg">
                  <LayoutGrid className="mr-2 h-5 w-5" />
                  See Platform Tour
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#080f1a] bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] flex items-center justify-center text-xs font-bold text-white">
                      {['JD', 'MK', 'SL', 'AR'][i-1]}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Trusted by 2,000+ clinicians</p>
                  <div className="flex items-center gap-1 text-[#1e8a52]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs">HIPAA Compliant • ISO 27001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual - Abstract Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1196b0]/20 to-[#2ab3cc]/20 rounded-3xl blur-2xl transform rotate-3" />
              <div className="relative bg-white dark:bg-[#101c2c] rounded-2xl shadow-2xl border border-[#c8ddef] dark:border-white/10 overflow-hidden">
                {/* Mock Dashboard Header */}
                <div className="bg-[#0b2a4a] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#e03620]" />
                    <div className="w-3 h-3 rounded-full bg-[#c47e10]" />
                    <div className="w-3 h-3 rounded-full bg-[#1e8a52]" />
                  </div>
                  <div className="text-white/60 text-xs font-mono">MPG Care Hub • Live Dashboard</div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#f4f8fd] dark:bg-white/5 rounded-lg p-4 border border-[#c8ddef] dark:border-white/10">
                      <div className="text-xs text-[#6a87a0] mb-1">Active Patients</div>
                      <div className="text-2xl font-bold text-[#1196b0]">24</div>
                      <div className="h-1 bg-[#1196b0]/20 rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-3/4 bg-[#1196b0] rounded-full" />
                      </div>
                    </div>
                    <div className="bg-[#f4f8fd] dark:bg-white/5 rounded-lg p-4 border border-[#c8ddef] dark:border-white/10">
                      <div className="text-xs text-[#6a87a0] mb-1">Queue Status</div>
                      <div className="text-2xl font-bold text-[#c47e10]">5</div>
                      <div className="h-1 bg-[#c47e10]/20 rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-1/2 bg-[#c47e10] rounded-full" />
                      </div>
                    </div>
                    <div className="bg-[#f4f8fd] dark:bg-white/5 rounded-lg p-4 border border-[#c8ddef] dark:border-white/10">
                      <div className="text-xs text-[#6a87a0] mb-1">Revenue Today</div>
                      <div className="text-2xl font-bold text-[#1e8a52]">₦2.4M</div>
                      <div className="h-1 bg-[#1e8a52]/20 rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-4/5 bg-[#1e8a52] rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f4f8fd] dark:bg-white/5 rounded-lg p-4 border border-[#c8ddef] dark:border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold">Recent Admissions</div>
                      <div className="text-xs text-[#1196b0]">View all</div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: "Fatima Njoku", id: "PAT-2026-0041", status: "Admitted", color: "bg-[#1196b0]" },
                        { name: "Emmanuel Kum", id: "PAT-2026-0038", status: "In Treatment", color: "bg-[#c47e10]" },
                        { name: "Marie Abanda", id: "PAT-2026-0044", status: "Stable", color: "bg-[#1e8a52]" },
                      ].map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between py-2 border-b border-[#c8ddef] dark:border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${patient.color}`} />
                            <div>
                              <div className="text-sm font-medium">{patient.name}</div>
                              <div className="text-xs text-[#6a87a0]">{patient.id}</div>
                            </div>
                          </div>
                          <div className="text-xs text-[#6a87a0]">{patient.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-[#101c2c] rounded-xl shadow-xl border border-[#c8ddef] dark:border-white/10 p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1e8a52]/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-[#1e8a52]" />
                </div>
                <div>
                  <div className="text-sm font-bold">3x Faster</div>
                  <div className="text-xs text-[#6a87a0]">Patient processing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-[#c8ddef] dark:border-white/8 bg-white/50 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm font-medium text-[#6a87a0] dark:text-[#9ab0c4] mb-6 uppercase tracking-wider">
            Trusted by leading healthcare institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {trustLogos.map((logo) => (
              <div key={logo} className="text-lg font-bold text-[#3a5068] dark:text-[#9ab0c4]">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-bold text-[#1196b0] uppercase tracking-wider mb-3">Complete Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Every department.<br />
              One connected workflow.
            </h2>
            <p className="text-lg text-[#3a5068] dark:text-[#9ab0c4]">
              Stop patching together separate systems. MPG Care Hub unifies your entire hospital
              operation in a single, coherent platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white dark:bg-[#101c2c] rounded-2xl p-8 border border-[#c8ddef] dark:border-white/8 hover:shadow-xl hover:shadow-[#1196b0]/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className={`px-3 py-1 rounded-full ${feature.lightColor} text-sm font-bold text-[#0d1b2a] dark:text-white`}>
                      {feature.stat}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-[#3a5068] dark:text-[#9ab0c4] leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-sm font-semibold text-[#1196b0] group-hover:gap-2 transition-all">
                    <span>Learn more</span>
                    <ChevronRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </div>

                  {/* Hover Gradient */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 bg-white dark:bg-[#0c1520]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-bold text-[#1196b0] uppercase tracking-wider mb-3">Workflow-First Design</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Built around how hospitals actually work
              </h2>
              <p className="text-lg text-[#3a5068] dark:text-[#9ab0c4] mb-8 leading-relaxed">
                Most hospital software forces you to adapt to it. We studied clinical workflows
                for 2 years to build a system that adapts to you.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Activity, title: "Real-time synchronization", desc: "Every department sees the same patient data instantly" },
                  { icon: ShieldCheck, title: "Role-based access", desc: "Doctors, nurses, and admins see exactly what they need" },
                  { icon: Clock, title: "Smart queue management", desc: "Automatically prioritize based on urgency and wait time" },
                  { icon: BarChart3, title: "Operational insights", desc: "Spot bottlenecks before they become crises" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f4f8fd] dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-[#1196b0]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-[#3a5068] dark:text-[#9ab0c4]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1196b0]/20 to-[#2ab3cc]/20 rounded-3xl blur-2xl" />
              <div className="relative bg-[#f4f8fd] dark:bg-[#101c2c] rounded-2xl p-8 border border-[#c8ddef] dark:border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#0c1520] rounded-xl shadow-sm border border-[#c8ddef] dark:border-white/5">
                    <div className="w-10 h-10 rounded-full bg-[#1196b0]/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#1196b0]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Patient arrives at Front Desk</div>
                      <div className="text-sm text-[#6a87a0]">Registration initiated</div>
                    </div>
                    <div className="text-xs text-[#1e8a52] font-medium">2 min</div>
                  </div>

                  <div className="flex justify-center">
                    <div className="h-8 w-0.5 bg-[#c8ddef] dark:bg-white/10" />
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#0c1520] rounded-xl shadow-sm border border-[#c8ddef] dark:border-white/5 ml-8">
                    <div className="w-10 h-10 rounded-full bg-[#c47e10]/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#c47e10]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Queued for Triage</div>
                      <div className="text-sm text-[#6a87a0]">Priority: Standard</div>
                    </div>
                    <div className="text-xs text-[#c47e10] font-medium">5 min</div>
                  </div>

                  <div className="flex justify-center">
                    <div className="h-8 w-0.5 bg-[#c8ddef] dark:bg-white/10" />
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#0c1520] rounded-xl shadow-sm border border-[#c8ddef] dark:border-white/5 ml-8">
                    <div className="w-10 h-10 rounded-full bg-[#1e8a52]/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-[#1e8a52]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Doctor Consultation</div>
                      <div className="text-sm text-[#6a87a0]">Dr. Sarah Chen assigned</div>
                    </div>
                    <div className="text-xs text-[#1e8a52] font-medium">15 min</div>
                  </div>

                  <div className="flex justify-center">
                    <div className="h-8 w-0.5 bg-[#c8ddef] dark:bg-white/10" />
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#1196b0]/5 to-[#2ab3cc]/5 dark:from-[#1196b0]/10 dark:to-[#2ab3cc]/10 rounded-xl border border-[#1196b0]/20">
                    <div className="w-10 h-10 rounded-full bg-[#1196b0] flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Treatment Complete</div>
                      <div className="text-sm text-[#6a87a0]">Prescription sent to pharmacy</div>
                    </div>
                    <div className="text-xs font-bold text-[#1196b0]">Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b2a4a] to-[#0d6175]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2ab3cc]/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#534ab7]/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-[#6ccfe0] uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Loved by clinical teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Sparkles key={star} className="h-5 w-5 text-[#e5a330] fill-[#e5a330]" />
                  ))}
                </div>
                <p className="text-lg text-white/90 leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-white/60">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative bg-gradient-to-br from-[#0b2a4a] to-[#1196b0] rounded-3xl p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#2ab3cc] rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#534ab7] rounded-full blur-3xl" />
            </div>

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                  Ready to transform your hospital operations?
                </h2>
                <p className="text-xl text-white/80 mb-8">
                  Join 50+ hospitals already using MPG Care Hub to deliver better patient care.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-white text-[#0b2a4a] hover:bg-[#eef5ff] h-14 px-8 text-lg font-semibold">
                    Start Free Trial
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg">
                    Talk to Sales
                  </Button>
                </div>
                <p className="text-sm text-white/60 mt-4">
                  No credit card required. 14-day free trial.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Free onboarding & training",
                  "24/7 technical support",
                  "99.9% uptime SLA",
                  "Data migration assistance",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-6 w-6 text-[#6ccfe0]" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0c1520] border-t border-[#c8ddef] dark:border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] text-white">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">MPG Care Hub</span>
              </div>
              <p className="text-[#3a5068] dark:text-[#9ab0c4] max-w-sm mb-6">
                Modern hospital operations platform connecting every department in one unified workflow.
              </p>
              <div className="flex gap-4">
                <Globe className="h-5 w-5 text-[#6a87a0]" />
                <Lock className="h-5 w-5 text-[#6a87a0]" />
                <ShieldCheck className="h-5 w-5 text-[#6a87a0]" />
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#3a5068] dark:text-[#9ab0c4]">
                <li><Link href="#" className="hover:text-[#1196b0]">Features</Link></li>
                <li><Link href="#" className="hover:text-[#1196b0]">Pricing</Link></li>
                <li><Link href="#" className="hover:text-[#1196b0]">Security</Link></li>
                <li><Link href="#" className="hover:text-[#1196b0]">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#3a5068] dark:text-[#9ab0c4]">
                <li><Link href="#" className="hover:text-[#1196b0]">About</Link></li>
                <li><Link href="#" className="hover:text-[#1196b0]">Blog</Link></li>
                <li><Link href="#" className="hover:text-[#1196b0]">Careers</Link></li>
                <li><Link href="#" className="hover:text-[#1196b0]">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#c8ddef] dark:border-white/8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#6a87a0]">
              © 2026 MPG Care Hub. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-[#6a87a0]">
              <Link href="#" className="hover:text-[#1196b0]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#1196b0]">Terms of Service</Link>
              <Link href="#" className="hover:text-[#1196b0]">HIPAA Compliance</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
