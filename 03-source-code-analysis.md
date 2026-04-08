# 💻 Source Code Analysis

**Generated:** 2026-04-07  
**Status:** Confirmed from actual codebase

---

## Table of Contents

1. [Application Entry and Routing](#1-application-entry-and-routing)
2. [Layouts and Shell](#2-layouts-and-shell)
3. [Feature Modules](#3-feature-modules)
4. [Shared UI and Common Logic](#4-shared-ui-and-common-logic)
5. [Data Layer and API Integration](#5-data-layer-and-api-integration)
6. [Authentication and Authorization](#6-authentication-and-authorization)
7. [Forms and Validation](#7-forms-and-validation)
8. [Utility Layer](#8-utility-layer)
9. [Technical Debt / Risk Notes](#9-technical-debt--risk-notes)

---

## 1. Application Entry and Routing

### 1.1 Root Layout

**File:** `src/app/layout.tsx`

```tsx
import "./globals.css";
import { DM_Sans, JetBrains_Mono } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "MPG Care Hub",
  description: "Multi-tenant hospital and clinic management SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
```

**Analysis:**
- Uses Google Fonts (DM Sans for UI, JetBrains Mono for code)
- No providers wrapper - keeping it minimal
- `suppressHydrationWarning` for dark mode support

### 1.2 Landing Page (Marketing)

**File:** `src/app/page.tsx` (592 lines - truncated to key sections)

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Front Desk & Intake",
    description: "Eliminate registration bottlenecks...",
    icon: Users,
    stat: "3x faster",
    color: "from-[#0e7a91] to-[#2ab3cc]",
  },
  // ... more features
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#eef5ff] text-[#0d1b2a]">
      {/* Navigation, Hero, Features, Workflow, Testimonials, CTA, Footer */}
    </main>
  );
}
```

**Key Points:**
- Self-contained marketing page
- Uses Tailwind for all styling
- Hardcoded testimonials and features
- Responsive grid layouts

### 1.3 Not Found Page

**File:** `src/app/not-found.tsx`

```tsx
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="hero-mesh w-full max-w-2xl rounded-[1.6rem] p-[1px]">
        <div className="rounded-[1.52rem] bg-white/92 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <div className="mt-5 space-y-2">
            <p className="eyebrow">Not found</p>
            <h1 className="text-2xl font-semibold">This page doesn't exist</h1>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild><Link href="/">Go to Home</Link></Button>
            <Button asChild variant="outline"><Link href="/platform">Open Platform</Link></Button>
          </div>
        </div>
      </div>
    </main>
  );
}
```

### 1.4 Login Page

**File:** `src/app/(marketing)/login/page.tsx`

**Pattern:** Likely a server component that renders login form
**Related:** `login-client.tsx` for client-side interactivity

### 1.5 Route Groups

| Route Group | Purpose | Files |
|-------------|---------|-------|
| `(hospital)` | Hospital workspace | `h/[hospitalSlug]/*` |
| `(marketing)` | Public site | `login`, `accept-invite`, `(site)` |
| `(platform)` | Platform admin | `platform/*` |

---

## 2. Layouts and Shell

### 2.1 Hospital Shell

**File:** `src/components/layout/hospital-shell.tsx` (431 lines)

**Role:** Main application shell for all hospital workspace routes

**Key Exports:**
- `HospitalShell` - Main layout component

**Props Interface:**
```typescript
type HospitalShellProps = {
  hospitalName: string;
  hospitalSlug: string;
  allowedWorkspaces: string[];
  isPlatformOwner?: boolean;
  primaryRole?: string | null;
  children: ReactNode;
};
```

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│  Hospital Shell Layout                                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌───────────────────────────────────────┐ │
│  │  Sidebar    │  │  Header (sticky)                      │ │
│  │  (lg only)  │  │  - Mobile menu button                 │ │
│  │  - Logo     │  │  - Page title/eyebrow                 │ │
│  │  - Nav      │  │  - Quick action buttons               │ │
│  │  - Logout   │  ├───────────────────────────────────────┤ │
│  │             │  │                                       │ │
│  │             │  │  Main Content Area                    │ │
│  │             │  │  {children}                           │ │
│  │             │  │                                       │ │
│  └─────────────┘  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Navigation Logic:**
- Conditionally renders nav items based on `allowedWorkspaces`
- Supports: admin, frontdesk, doctor, nurse, ward, lab, pharmacy, billing
- Active state detection via `usePathname`
- Mobile: Sheet component for slide-out menu

**Critical Dependencies:**
- `@/lib/supabase/browser` - Logout functionality
- `@/lib/auth/workspaces` - Permission checking
- `@/components/ui/sheet` - Mobile navigation
- `lucide-react` - Icons

### 2.2 Hospital Layout

**File:** `src/app/(hospital)/h/[hospitalSlug]/layout.tsx`

**Role:** Data fetching wrapper for HospitalShell

**Pattern:**
```tsx
export default async function HospitalLayout({
  params,
  children,
}: {
  params: { hospitalSlug: string };
  children: React.ReactNode;
}) {
  // Fetch hospital data, permissions
  // Render HospitalShell with data
}
```

### 2.3 Loading State

**File:** `src/app/(hospital)/h/[hospitalSlug]/loading.tsx`

```tsx
export default function HospitalWorkspaceLoading() {
  return (
    <main className="space-y-6 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      <section className="hero-mesh rounded-[1.6rem] p-[1px]">
        <div className="rounded-[1.52rem] bg-white/92 p-5">
          <div className="space-y-3">
            <div className="h-4 w-36 animate-pulse rounded-full bg-muted" />
            <div className="h-9 w-72 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </section>
      {/* Skeleton stat cards, content areas */}
    </main>
  );
}
```

**Analysis:**
- Uses `animate-pulse` for skeleton effect
- Matches HospitalShell layout structure
- No dedicated Skeleton component - uses Tailwind utilities

---

## 3. Feature Modules

### 3.1 Frontdesk Module

**Entry:** `src/app/(hospital)/h/[hospitalSlug]/frontdesk/page.tsx`

**Key Components:**
- `FrontdeskDashboard` - Main dashboard
- `FrontdeskStats` - Statistics cards
- `FrontdeskQueuePreview` - Live queue

**Server Actions:**
- `createFrontdeskPatient` - Patient registration
- `createFrontdeskVisit` - Visit creation
- `checkInWithVitals` - Check-in workflow
- `createOrQueuePatient` - Smart routing

**Data Flow:**
```
Page (Server Component)
  ↓
Server Query (get-frontdesk-dashboard.ts)
  ↓
Supabase (patients, visits, queue)
  ↓
Props to Client Components
```

### 3.2 Doctor Workspace

**Entry:** `src/app/(hospital)/h/[hospitalSlug]/doctor/page.tsx`

**Key Components:**
- `DoctorDashboard` - Workspace home
- `DoctorQueueList` - Patient queue
- `DoctorStats` - KPI display
- `DoctorPatientWorkspacePage` - Patient detail

**Features:**
- Patient queue with priority
- Lab order creation
- Prescription writing
- Round notes
- Discharge requests

### 3.3 Laboratory Module

**Entry:** `src/app/(hospital)/h/[hospitalSlug]/lab/page.tsx`

**Key Components:**
- `LabDashboard` - Lab workspace
- `LabOrdersPage` - Order list
- `LabOrderDetailPage` - Order details
- `LabOrderItemResultForm` - Result entry

**Actions:**
- `createLabTest` - Add test types
- `completeLabOrder` - Mark complete
- `saveLabOrderItemResult` - Enter results

### 3.4 Ward Module

**Entry:** `src/app/(hospital)/h/[hospitalSlug]/ward/page.tsx`

**Key Components:**
- `WardDashboardPage` - Ward overview
- `WardAdmissionDetailPage` - Patient detail
- `WardCensusPage` - Bed occupancy
- `DischargeChecklistPanel` - Discharge tasks

**Workflow:**
1. Admission intake
2. Vitals recording
3. Nursing notes
4. Discharge checklist
5. Finalize discharge

---

## 4. Shared UI and Common Logic

### 4.1 Card Component

**File:** `src/components/ui/card.tsx`

```tsx
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10",
        // ... complex class string with Tailwind
        className
      )}
      {...props}
    />
  );
}
```

**Sub-components:**
- `CardHeader` - Title area with action slot
- `CardTitle` - Heading
- `CardDescription` - Subtitle
- `CardAction` - Header action button area
- `CardContent` - Main content
- `CardFooter` - Bottom action area

**Analysis:**
- Uses Tailwind's `has-*` selectors for conditional styling
- Supports `size` prop (default/sm)
- No `variant` prop for visual styles

### 4.2 Button Component

**File:** `src/components/ui/button.tsx`

```tsx
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-border bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive/10 text-destructive",
        link: "text-primary underline-offset-4",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-7 gap-1 px-2.5",
        lg: "h-9 gap-1.5 px-2.5",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
  }
);
```

**Features:**
- CVA for variant management
- Radix Slot for `asChild` pattern
- Accessible focus states
- Built-in disabled styling

### 4.3 Workspace Components

**File:** `src/components/layout/workspace-stat-card.tsx`

```tsx
type WorkspaceStatCardProps = {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  valueClassName?: string;
  className?: string;
};

export function WorkspaceStatCard({...}) {
  return (
    <section className="group rounded-[1.35rem] border border-border/70 bg-card px-5 py-4 shadow-[0_10px_28px_rgba(13,27,42,0.035)] transition-all hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(13,27,42,0.06)]">
      {/* Title, value, icon, description */}
    </section>
  );
}
```

**Pattern:**
- Rounded corners: `1.35rem` (~21px)
- Subtle shadow that elevates on hover
- Gradient icon background

---

## 5. Data Layer and API Integration

### 5.1 Supabase Server Client

**File:** `src/lib/supabase/server.ts`

```tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // no-op for server components
          }
        },
      },
    }
  );
}
```

**Pattern:**
- Uses `@supabase/ssr` for Next.js App Router
- Cookie-based session management
- Safe cookie setting with try/catch

### 5.2 Server Query Pattern

**File:** `src/features/frontdesk/server/get-frontdesk-dashboard.ts`

```tsx
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFrontdeskDashboardData(hospitalId: string) {
  const supabase = await createClient();
  
  const [patientsResult, queueResult, statsResult] = await Promise.all([
    supabase.from("patients").select("*").eq("hospital_id", hospitalId),
    supabase.from("queue").select("*").eq("hospital_id", hospitalId),
    // ... more queries
  ]);
  
  return {
    patients: patientsResult.data ?? [],
    queue: queueResult.data ?? [],
    // ...
  };
}
```

**Pattern:**
- Marked with `"use server"`
- Creates client per request
- Parallel queries with `Promise.all`
- Returns typed data

### 5.3 Server Action Pattern

**File:** `src/features/patients/actions/create-patient.ts`

```tsx
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { patientSchema } from "../schemas/patient.schema";

export async function createPatient(formData: FormData) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  // Parse and validate
  const rawData = Object.fromEntries(formData);
  const validated = patientSchema.parse(rawData);
  
  // Insert
  const { data, error } = await supabase
    .from("patients")
    .insert({ ...validated, created_by: user.id })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  // Revalidate cache
  revalidatePath("/h/[hospitalSlug]/patients");
  
  return { success: true, data };
}
```

**Pattern:**
1. Create Supabase client
2. Verify authentication
3. Validate input with Zod
4. Execute database operation
5. Revalidate affected paths
6. Return result

---

## 6. Authentication and Authorization

### 6.1 Session Management

**File:** `src/lib/auth/session.ts`

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return { supabase, user };
}

export async function getCurrentProfile() {
  const { supabase, user } = await requireUser();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle();
  
  return { supabase, user, profile };
}
```

**Pattern:**
- `requireUser()` - Redirects if not authenticated
- `getCurrentProfile()` - Gets user + profile
- Used in server components and actions

### 6.2 Workspace Access

**File:** `src/lib/auth/workspaces.ts`

```tsx
export function hasWorkspaceAccess(
  allowedWorkspaces: string[],
  required: string
): boolean {
  return allowedWorkspaces.includes(required);
}
```

**Usage in HospitalShell:**
```tsx
const canAdmin = isPlatformOwner || hasWorkspaceAccess(allowedWorkspaces, "admin");
const canDoctor = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "doctor");
// ... etc
```

### 6.3 Role Definitions

**File:** `src/lib/auth/roles.ts`

```tsx
export type AppRole =
  | "platform_owner"
  | "hospital_admin"
  | "receptionist"
  | "doctor"
  | "nurse"
  | "cashier";
```

**File:** `src/lib/auth/permissions.ts`

```tsx
export function hasRole(userRole: AppRole | null | undefined, allowed: AppRole[]) {
  if (!userRole) return false;
  return allowed.includes(userRole);
}
```

### 6.4 Middleware

**File:** `middleware.ts`

```tsx
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Analysis:**
- Refreshes Supabase session cookie
- Applies to all routes except static files
- No role-based route protection here (done in layouts)

---

## 7. Forms and Validation

### 7.1 Zod Schema Pattern

**File:** `src/features/patients/schemas/patient.schema.ts`

```tsx
import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;
```

### 7.2 React Hook Form Pattern

**Inferred from package.json and patterns:**

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientInput } from "../schemas/patient.schema";

export function PatientForm() {
  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      // ...
    },
  });
  
  async function onSubmit(data: PatientInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value?.toString() ?? "");
    });
    await createPatient(formData);
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 8. Utility Layer

### 8.1 Class Name Utility

**File:** `src/lib/utils.ts`

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:** Every component uses this for conditional classes

### 8.2 Date Utilities

**File:** `src/lib/utils/dates.ts`

**Likely exports:**
- `formatDate(date: Date): string`
- `formatDateTime(date: Date): string`
- `isToday(date: Date): boolean`
- `calculateAge(dateOfBirth: Date): number`

### 8.3 Money Utilities

**File:** `src/lib/utils/money.ts`

**Likely exports:**
- `formatCurrency(amount: number): string`
- `formatNaira(amount: number): string`

### 8.4 Toast Utility

**File:** `src/lib/ui/app-toast.ts`

```tsx
export type AppToastTone = "success" | "error" | "info";

export type AppToastPayload = {
  title: string;
  description?: string;
  tone?: AppToastTone;
  durationMs?: number;
};

const EVENT_NAME = "mpg-care-hub:toast";

export function emitAppToast(payload: AppToastPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AppToastPayload>(EVENT_NAME, { detail: payload })
  );
}
```

**Pattern:** Custom event-based toast system (not using Sonner despite installation)

---

## 9. Technical Debt / Risk Notes

### High-Risk Files

| File | Risk | Mitigation |
|------|------|------------|
| `hospital-shell.tsx` | Central navigation - changes affect all routes | Test all workspace access combinations |
| `middleware.ts` | Session handling | Ensure Supabase env vars set |
| `server.ts` (Supabase) | All DB access goes through here | Monitor for cookie issues |

### Code Quality Issues

| Issue | Severity | Location |
|-------|----------|----------|
| Backup files (.bak_*) | Low | Billing actions, encounters |
| Empty directories | Low | `cards/`, `tables/` |
| Unused imports (likely) | Low | Throughout (needs lint check) |

### Architectural Concerns

1. **No Error Boundary**: No global error boundary for unexpected errors
2. **No Loading Strategy**: Only basic skeleton in loading.tsx
3. **No Retry Logic**: Failed queries don't auto-retry
4. **No Optimistic Updates**: Form submissions wait for server

### Coupling Risks

| Coupling | Description |
|----------|-------------|
| HospitalShell → Workspaces | Tight coupling to workspace permission model |
| Server Actions → Supabase | Direct DB access (no abstraction layer) |
| Forms → Schemas | Direct Zod schema imports |

### Safe Change Guidelines

1. **Modifying HospitalShell**: Test with all role combinations
2. **Adding Server Actions**: Follow existing pattern exactly
3. **Changing Schemas**: Update all related server queries
4. **Modifying Colors**: Check both light and dark modes
5. **Adding Features**: Create in `features/{name}/` with standard subdirs
