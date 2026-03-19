export type MarketingTier = {
  name: string;
  tagline: string;
  price: number | null;
  period: string;
  note: string;
  highlight: boolean;
  cta: string;
  ctaHref: string;
  features: string[];
};

export const TIERS: MarketingTier[] = [
  {
    name: "Starter",
    tagline: "For single clinics and small hospitals getting started",
    price: 49,
    period: "per month",
    note: "billed monthly · cancel anytime",
    highlight: false,
    cta: "Start free trial",
    ctaHref: "/login?next=/onboarding/create-facility",
    features: [
      "1 hospital facility",
      "Up to 15 staff accounts",
      "All 8 workspaces included",
      "Email support",
    ],
  },
  {
    name: "Growth",
    tagline: "For growing multi-facility operations that need more scale",
    price: 129,
    period: "per month",
    note: "billed monthly · most popular",
    highlight: true,
    cta: "Start free trial",
    ctaHref: "/login?next=/onboarding/create-facility",
    features: [
      "Up to 5 hospital facilities",
      "Unlimited staff accounts",
      "All 8 workspaces included",
      "Priority email & chat support",
      "Multi-facility platform console",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For health networks and hospital groups at any scale",
    price: null,
    period: "",
    note: "custom contract · flexible billing",
    highlight: false,
    cta: "Contact sales",
    ctaHref: "/login",
    features: [
      "Unlimited hospital facilities",
      "Unlimited staff accounts",
      "Everything in Growth",
      "Dedicated onboarding specialist",
      "Custom SLA & uptime guarantee",
    ],
  },
];
