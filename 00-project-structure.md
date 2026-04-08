# 📁 Project Structure

**Generated:** 2026-04-07  
**Repository:** E:\mpg-care-hub  
**Status:** Confirmed from actual codebase

---

## Overview

MPG Care Hub is a multi-tenant hospital and clinic management SaaS application. The codebase follows a feature-based architecture with Next.js App Router.

---

## Directory Tree

```
E:\mpg-care-hub
├── .env.local                      # Environment variables (sensitive)
├── .git/                           # Git repository data
├── .gitignore                      # Git ignore rules
├── .next/                          # Next.js build output (excluded)
├── components.json                 # shadcn/ui configuration
├── eslint.config.mjs              # ESLint configuration
├── middleware.ts                   # Next.js middleware (auth)
├── next-env.d.ts                  # Next.js TypeScript declarations
├── next.config.ts                 # Next.js configuration
├── node_modules/                  # Dependencies (excluded)
├── package-lock.json              # Lock file
├── package.json                   # Project dependencies
├── postcss.config.mjs             # PostCSS configuration
├── public/                        # Static assets
│   └── (empty confirmed)
├── README.md                      # Basic Next.js readme
├── src/                           # Source code
│   ├── app/                       # Next.js App Router
│   ├── components/                # Shared UI components
│   ├── features/                  # Feature-based modules
│   └── lib/                       # Utilities and shared logic
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.tsbuildinfo          # TypeScript build info
├── ui_core_files.txt             # (empty file)
└── ui_structure.txt              # (empty file)
```

---

## Source Directory Structure

### App Router (`src/app/`)

```
src/app/
├── (hospital)/                    # Hospital workspace route group
│   └── h/
│       └── [hospitalSlug]/        # Dynamic hospital routes
│           ├── access-denied/
│           ├── activity/
│           ├── admin/             # Administration module
│           │   ├── access/
│           │   ├── beds/
│           │   ├── departments/
│           │   ├── lab-tests/
│           │   ├── medications/
│           │   ├── pharmacy-stock/
│           │   └── wards/
│           ├── appointments/
│           │   ├── [appointmentId]/
│           │   └── new/
│           ├── billing/           # Billing module
│           │   ├── invoices/
│           │   └── payments/
│           ├── census/
│           ├── doctor/            # Doctor workspace
│           │   ├── admissions/
│           │   ├── appointments/
│           │   ├── patients/
│           │   ├── prescriptions/
│           │   └── rounds/
│           ├── encounters/        # Clinical encounters
│           ├── frontdesk/         # Front desk module
│           ├── lab/               # Laboratory module
│           ├── nurse/             # Nursing module
│           ├── patients/          # Patient management
│           ├── pharmacy/          # Pharmacy module
│           ├── settings/
│           ├── staff/             # Staff management
│           └── ward/              # Ward management
├── (marketing)/                   # Marketing site route group
│   ├── (site)/
│   ├── accept-invite/
│   └── login/
├── (platform)/                    # Platform admin route group
│   └── platform/
│       └── hospitals/
├── auth/
│   └── callback/
├── onboarding/
│   └── create-facility/
├── reset-password/
├── layout.tsx                     # Root layout
├── page.tsx                       # Landing page (592 lines)
├── globals.css                    # Global styles (226 lines)
├── loading.tsx                    # Global loading
└── not-found.tsx                  # 404 page
```

### Components (`src/components/`)

```
src/components/
├── cards/                         # (empty directory)
├── feedback/                      # Feedback components
│   ├── app-toast-host.tsx
│   ├── inline-feedback.tsx
│   └── route-feedback-bar.tsx
├── forms/                         # Form utilities
│   ├── form-message.tsx
│   └── submit-button.tsx
├── layout/                        # Layout components
│   ├── hospital-shell.tsx         # Main app shell (431 lines)
│   ├── info-grid.tsx
│   ├── patient-summary-panel.tsx
│   ├── platform-shell.tsx
│   ├── status-badge.tsx
│   ├── workflow-step-card.tsx
│   ├── workspace-empty-state.tsx
│   ├── workspace-page-header.tsx
│   ├── workspace-section-header.tsx
│   └── workspace-stat-card.tsx
├── tables/                        # (empty directory)
└── ui/                            # shadcn/ui components
    ├── badge.tsx
    ├── button.tsx                 # CVA-based button
    ├── card.tsx                   # Card component
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── sheet.tsx
    ├── table.tsx
    └── textarea.tsx
```

### Features (`src/features/`)

```
src/features/
├── admin-setup/                   # Hospital admin configuration
├── appointments/                  # Appointment management
├── auth/                          # Authentication
├── billing/                       # Billing and invoicing
├── dashboard/                     # Dashboard components
├── doctor/                        # Doctor workflows
├── doctor-rounds/                 # Doctor rounds tracking
├── doctor-workflow/               # Doctor patient workflow
├── encounters/                    # Clinical encounters
├── frontdesk/                     # Front desk operations
├── hospitals/                     # Hospital management
├── invitations/                   # User invitations
├── lab/                           # Laboratory management
├── nurse/                         # Nursing workflows
├── patients/                      # Patient records
├── pharmacy/                      # Pharmacy management
├── platform/                      # Platform-level features
├── staff/                         # Staff management
└── ward/                          # Ward/inpatient management
```

### Library (`src/lib/`)

```
src/lib/
├── audit/                         # Audit logging
│   └── write-audit-log.ts
├── auth/                          # Authentication & authorization
│   ├── get-hospital-access-context.ts
│   ├── guards.ts
│   ├── permissions.ts
│   ├── require-hospital-workspace-access.ts
│   ├── roles.ts                   # Role definitions
│   ├── session.ts                 # Session management
│   └── workspaces.ts              # Workspace access
├── db/                            # Database types
│   └── types.ts
├── email/                         # Email services
│   └── send-hospital-invitation-email.ts
├── marketing/                     # Marketing data
│   └── pricing-data.ts
├── supabase/                      # Supabase clients
│   ├── browser.ts
│   ├── middleware.ts
│   └── server.ts
├── ui/                            # UI utilities
│   ├── app-toast.ts
│   └── get-friendly-error-message.ts
├── utils/                         # General utilities
│   ├── audit.ts
│   ├── dates.ts
│   ├── money.ts
│   └── slug.ts
└── utils.ts                       # cn() utility
```

---

## File Statistics

### By Extension

| Extension | Count | Notes |
|-----------|-------|-------|
| .tsx | ~280 | React components (JSX) |
| .ts | ~180 | TypeScript files |
| .css | 1 | Global styles only |
| .scss | 0 | Not used |
| .json | 5 | Config files |
| .md | 1 | README only |
| .mjs | 2 | ES module configs |

### By Category

| Category | Count | Description |
|----------|-------|-------------|
| UI Components | 11 | shadcn/ui components in `components/ui/` |
| Layout Components | 10 | Shells, headers, workspace layouts |
| Feature Modules | 17 | Major functional areas |
| Server Actions | ~60 | Next.js server actions for mutations |
| Server Queries | ~50 | Data fetching functions |
| Schemas | 8 | Zod validation schemas |
| Utilities | 15+ | Helper functions |
| Pages/Routes | ~80 | Next.js app router pages |

---

## Critical Paths

### Entry Points

| Entry | File | Purpose |
|-------|------|---------|
| Root Layout | `src/app/layout.tsx` | Application shell, fonts |
| Landing Page | `src/app/page.tsx` | Marketing site homepage |
| Hospital Layout | `src/app/(hospital)/h/[hospitalSlug]/layout.tsx` | Hospital workspace wrapper |
| Login | `src/app/(marketing)/login/page.tsx` | Authentication entry |

### Key Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `package.json` | Dependencies & scripts | Confirmed |
| `next.config.ts` | Next.js configuration | Minimal (default) |
| `tsconfig.json` | TypeScript settings | Confirmed |
| `middleware.ts` | Auth middleware | Confirmed |
| `components.json` | shadcn/ui settings | Confirmed |
| `postcss.config.mjs` | Tailwind processing | Confirmed |

### Feature Entry Points

| Feature | Entry File | Description |
|---------|------------|-------------|
| Front Desk | `frontdesk/page.tsx` | Patient registration & queue |
| Doctor Workspace | `doctor/page.tsx` | Clinical workflow hub |
| Nursing | `nurse/page.tsx` | Vitals & nursing notes |
| Laboratory | `lab/page.tsx` | Lab orders & results |
| Pharmacy | `pharmacy/page.tsx` | Prescriptions & dispensing |
| Billing | `billing/page.tsx` | Invoices & payments |
| Ward | `ward/page.tsx` | Inpatient management |

### Shared Dependencies

| File | Used By | Purpose |
|------|---------|---------|
| `hospital-shell.tsx` | All hospital routes | Navigation & layout |
| `card.tsx` | Many components | UI card primitive |
| `button.tsx` | Many components | UI button primitive |
| `cn()` utility | Almost all components | Class merging |
| `createClient()` | Server components | Supabase client |

---

## Repository Shape Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        MPG CARE HUB                             │
│              Multi-tenant Hospital Management SaaS              │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: App Router (Next.js 16)                               │
│  ├── Marketing Site (Landing, Login, Pricing)                   │
│  ├── Platform Admin (Hospital management)                       │
│  └── Hospital Workspace (Main application)                      │
│       ├── Front Desk → Appointments → Encounters                │
│       ├── Doctor → Lab → Pharmacy → Billing                     │
│       └── Nurse → Ward → Admin                                  │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: Features (Domain-driven)                              │
│  ├── Each feature: actions/, components/, schemas/, server/     │
│  └── Clear separation of concerns                               │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: Shared Components                                     │
│  ├── UI Primitives (shadcn/ui)                                  │
│  ├── Layout Components (shells, headers)                        │
│  └── Feedback Components (toasts, errors)                       │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 4: Infrastructure                                        │
│  ├── Auth (Supabase Auth + RBAC)                                │
│  ├── Database (Supabase PostgreSQL)                             │
│  └── Utilities (dates, money, validation)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Notes

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS v4 with CSS-first configuration
- **UI Library:** shadcn/ui (Radix UI primitives + Tailwind)
- **Auth:** Supabase Auth with custom RBAC
- **State:** React Server Components + Server Actions (no global state library)
- **Forms:** React Hook Form + Zod validation
- **Notifications:** Custom toast system (Sonner installed but custom implementation)
- **Icons:** Lucide React

---

## Observations

### Strengths
- Clear feature-based organization
- Consistent use of Server Components where possible
- Type-safe with TypeScript throughout
- shadcn/ui provides solid UI foundation

### Potential Issues
- Backup files present (*.bak_*) - should be cleaned up
- Some empty directories (cards/, tables/)
- No test files detected
- Database schema not visible in repo (managed via Supabase)
