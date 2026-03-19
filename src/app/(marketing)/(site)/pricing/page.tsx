import React from "react";
import Link from "next/link";

import { TIERS } from "@/lib/marketing/pricing-data";
import { Button } from "@/components/ui/button";

const comparisonRows = [
  {
    category: "Operations",
    features: [
      { label: "Facilities", starter: "1", growth: "Up to 5", enterprise: "Unlimited" },
      { label: "Staff accounts", starter: "Up to 15", growth: "Unlimited", enterprise: "Unlimited" },
      { label: "Core workspaces", starter: "Included", growth: "Included", enterprise: "Included" },
    ],
  },
  {
    category: "Support",
    features: [
      { label: "Support level", starter: "Email", growth: "Priority email & chat", enterprise: "Dedicated support" },
      { label: "Onboarding", starter: "Standard", growth: "Priority", enterprise: "Dedicated specialist" },
      { label: "SLA", starter: "—", growth: "—", enterprise: "Custom" },
    ],
  },
];

function ComparisonCell({ value }: { value: string }) {
  return <span className="text-sm text-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <main className="space-y-16 py-12">
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hero-mesh rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]">
          <div className="rounded-[1.52rem] bg-white/92 p-6 dark:bg-[#101c2c]/88 sm:p-8">
            <p className="eyebrow">Pricing</p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Pricing built for real hospital operations
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
              Choose a plan that matches your facility size today and still supports your growth tomorrow.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-[1.5rem] border p-6 shadow-sm ${
              tier.highlight ? "border-primary bg-card" : "border-border bg-card"
            }`}
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">{tier.name}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{tier.tagline}</p>
            </div>

            <div className="mt-6">
              {tier.price === null ? (
                <div className="text-3xl font-semibold text-foreground">Custom</div>
              ) : (
                <div className="text-3xl font-semibold text-foreground">
                  ${tier.price}
                  <span className="ml-2 text-base font-normal text-muted-foreground">{tier.period}</span>
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground">{tier.note}</p>
            </div>

            <ul className="mt-6 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="text-sm text-foreground">
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href={tier.ctaHref}>{tier.cta}</Link>
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[1.5rem] border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-foreground">Compare plans</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A quick side-by-side view of the main differences.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Starter
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Growth
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((section) => (
                  <React.Fragment key={section.category}>
                    <tr className="border-b bg-muted/30">
                      <td
                        colSpan={4}
                        className="py-2.5 pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {section.category}
                      </td>
                    </tr>
                    {section.features.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="py-3 pl-6 pr-3 text-sm text-foreground">{row.label}</td>
                        <td className="py-3 text-center"><ComparisonCell value={row.starter} /></td>
                        <td className="py-3 text-center"><ComparisonCell value={row.growth} /></td>
                        <td className="py-3 pr-6 text-center"><ComparisonCell value={row.enterprise} /></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
