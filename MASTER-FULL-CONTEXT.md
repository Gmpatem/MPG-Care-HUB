# 🤖 MASTER FULL CONTEXT: MPG Care Hub

**Generated:** 2026-04-07  
**Repository:** E:\mpg-care-hub  
**Type:** Healthcare SaaS - Multi-tenant Hospital Management System  
**Status:** Production-ready codebase

---

## 🎯 Executive Summary

MPG Care Hub is a **comprehensive hospital management SaaS platform** built with Next.js 16 and React 19. It connects front desk, clinical staff (doctors, nurses), laboratory, pharmacy, and billing in a unified workflow.

**Key Differentiators:**
- Multi-tenant architecture (one platform, many hospitals)
- Role-based workspace access (admin, doctor, nurse, lab, pharmacy, billing, frontdesk)
- Real-time patient flow tracking
- Integrated billing and clinical workflows
- Modern UI with healthcare-appropriate aesthetics

---

## 📊 Tech Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| React | React + React DOM | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| UI System | shadcn/ui + Radix UI | Latest |
| Backend | Supabase (Auth + PostgreSQL) | 2.98.0 |
| Forms | React Hook Form + Zod | 7.71.2 / 4.3.6 |
| Icons | Lucide React | 0.577.0 |
| Animation | Framer Motion | 12.36.0 (minimal use) |
| Toast | Custom (Sonner installed but unused) | - |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MPG CARE HUB ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        PRESENTATION LAYER                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │  Marketing  │  │  Platform   │  │  Hospital   │                 │   │
│  │  │  (Public)   │  │  (Admin)    │  │  (App)      │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │         │                │                  │                       │   │
│  │         └────────────────┴──────────────────┘                       │   │
│  │                          │                                          │   │
│  │              ┌───────────┴───────────┐                             │   │
│  │              │   HospitalShell       │                             │   │
│  │              │   (Layout + Nav)      │                             │   │
│  │              └───────────┬───────────┘                             │   │
│  │                          │                                          │   │
│  └──────────────────────────┼──────────────────────────────────────────┘   │
│                             │                                               │
│  ┌──────────────────────────┼──────────────────────────────────────────┐   │
│  │                     FEATURE LAYER                                     │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┐          │   │
│  │  │ Frontdesk│  Doctor  │   Lab    │ Pharmacy │  Billing │          │   │
│  │  ├──────────┼──────────┼──────────┼──────────┼──────────┤          │   │
│  │  │  Nurse   │   Ward   │  Admin   │  Staff   │Encounter │          │   │
│  │  └──────────┴──────────┴──────────┴──────────┴──────────┘          │   │
│  │                    (17 feature modules)                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DATA LAYER                                     │   │
│  │                                                                     │   │
│  │   Server Actions ──────┐                                           │   │
│  │   Server Queries ──────┼──▶ Supabase Client ───▶ PostgreSQL        │   │
│  │   Auth Middleware ─────┘        (SSR/cookies)                       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SHARED LAYER                                    │   │
│  │   UI Components │ Layouts │ Utils │ Auth │ Schemas │ Hooks          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛣️ Routing / Navigation Model

### Route Groups

| Group | Path | Purpose |
|-------|------|---------|
| `(marketing)` | `/`, `/login`, `/pricing` | Public marketing site |
| `(platform)` | `/platform/*` | Platform administration |
| `(hospital)` | `/h/[hospitalSlug]/*` | Hospital workspace (main app) |

### Hospital Workspace Navigation

```
Overview
└── Hospital Overview (Dashboard)

Patient Flow
├── Front Desk (conditional)
├── Appointments (conditional)
├── Encounters (conditional)
└── Patient Directory (conditional)

Clinical Workspaces
├── Doctor Workspace (conditional)
├── Nursing Station (conditional)
├── Ward Admissions (conditional)
├── Ward Census (conditional)
├── Laboratory (conditional)
├── Pharmacy (conditional)
└── Billing (conditional)

Administration (admin only)
├── Access Control
├── Staff Management
├── Ward Setup
├── Hospital Settings
└── Audit Activity
```

**Access Control:** Navigation items shown based on `allowedWorkspaces` array passed to HospitalShell.

---

## 📦 Core Modules / Features

### 1. Front Desk (`features/frontdesk/`)
**Purpose:** Patient registration and queue management

**Key Capabilities:**
- Smart patient search (avoid duplicates)
- New patient registration
- Visit creation and check-in
- Real-time queue preview
- Vital signs capture at intake

**Files:**
- Components: 9
- Actions: 4
- Server queries: 7

### 2. Doctor Workspace (`features/doctor/`, `features/doctor-workflow/`)
**Purpose:** Clinical care delivery

**Key Capabilities:**
- Patient queue with priority
- Clinical encounters
- Lab order creation
- Prescription writing
- Doctor rounds tracking
- Discharge requests

**Files:**
- Components: 12
- Actions: 4
- Server queries: 6

### 3. Laboratory (`features/lab/`)
**Purpose:** Lab order management and result entry

**Key Capabilities:**
- Lab order list
- Result entry by test item
- Order completion
- Test catalog management
- Integration with encounters

**Files:**
- Components: 8
- Actions: 3
- Server queries: 6

### 4. Pharmacy (`features/pharmacy/`)
**Purpose:** Prescription dispensing and stock management

**Key Capabilities:**
- Prescription queue
- Item-by-item dispensing
- Stock batch management
- Integration with billing

**Files:**
- Components: 6
- Actions: 2
- Server queries: 4

### 5. Billing (`features/billing/`)
**Purpose:** Invoice management and payment processing

**Key Capabilities:**
- Invoice creation with line items
- Payment recording
- Outstanding balance tracking
- Integration with clinical services

**Files:**
- Components: 8
- Actions: 2
- Server queries: 5

### 6. Ward Management (`features/ward/`)
**Purpose:** Inpatient care management

**Key Capabilities:**
- Bed occupancy tracking
- Admission workflow
- Discharge checklist
- Census reporting
- Transfer management

**Files:**
- Components: 17
- Actions: 9
- Server queries: 11

### 7. Nursing (`features/nurse/`)
**Purpose:** Nursing station operations

**Key Capabilities:**
- Vitals recording
- Nursing notes
- Discharge clearance
- Patient chart view

**Files:**
- Components: 9
- Actions: 3
- Server queries: 3

---

## 🧩 Shared Components / Hooks / Utilities

### UI Components (`components/ui/`)

| Component | Purpose | Variants |
|-----------|---------|----------|
| Button | Actions | default, outline, secondary, ghost, destructive, link |
| Card | Content containers | default, sm |
| Input | Text input | - |
| Label | Form labels | - |
| Select | Dropdowns | - |
| Dialog | Modals | - |
| Sheet | Slide-overs | left, right |
| Table | Data tables | - |
| Badge | Status labels | - |
| Textarea | Multi-line input | - |

### Layout Components (`components/layout/`)

| Component | Purpose |
|-----------|---------|
| HospitalShell | Main app shell with navigation |
| PlatformShell | Platform admin shell |
| WorkspacePageHeader | Page title + actions |
| WorkspaceSectionHeader | Section title + actions |
| WorkspaceStatCard | KPI display card |
| WorkspaceEmptyState | Empty list state |
| WorkflowStepCard | Step indicator |

### Feedback Components (`components/feedback/`)

| Component | Purpose |
|-----------|---------|
| AppToastHost | Global toast container |
| InlineFeedback | Inline error/success messages |
| RouteFeedbackBar | Route-level feedback |

### Utilities

| File | Purpose |
|------|---------|
| `lib/utils.ts` | `cn()` - Tailwind class merging |
| `lib/utils/dates.ts` | Date formatting |
| `lib/utils/money.ts` | Currency formatting |
| `lib/ui/app-toast.ts` | Toast event system |

### Auth Utilities

| File | Purpose |
|------|---------|
| `lib/auth/session.ts` | Session management |
| `lib/auth/workspaces.ts` | Workspace permissions |
| `lib/auth/roles.ts` | Role definitions |
| `lib/auth/permissions.ts` | Permission checking |

---

## 💾 Data Layer / Backend Integration

### Supabase Integration

**Client Types:**
- **Server:** `lib/supabase/server.ts` - For Server Components/Actions
- **Browser:** `lib/supabase/browser.ts` - For Client Components
- **Middleware:** `lib/supabase/middleware.ts` - Session refresh

### Server Actions Pattern

```typescript
"use server";

export async function createPatient(formData: FormData) {
  const supabase = await createClient();
  
  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  // 2. Validation
  const validated = patientSchema.parse(Object.fromEntries(formData));
  
  // 3. Database operation
  const { data, error } = await supabase
    .from("patients")
    .insert({ ...validated, created_by: user.id })
    .select()
    .single();
  
  // 4. Cache revalidation
  revalidatePath("/h/[hospitalSlug]/patients");
  
  return { success: true, data };
}
```

### Data Flow

```
User Action
    ↓
Server Action (lib/supabase/server.ts)
    ↓
Supabase Client (cookie-based auth)
    ↓
PostgreSQL (RLS policies enforce access)
    ↓
Response + Cache Revalidation
    ↓
UI Update
```

---

## 🔐 Auth / Permissions / Security Notes

### Authentication
- **Provider:** Supabase Auth
- **Method:** Email/password (inferred)
- **Session:** Cookie-based with automatic refresh
- **Middleware:** Session validation on all routes

### Authorization Model

**Roles:**
```typescript
type AppRole = 
  | "platform_owner"    // Full platform access
  | "hospital_admin"    // Single hospital admin
  | "receptionist"      // Front desk
  | "doctor"            // Clinical
  | "nurse"             // Nursing
  | "cashier";          // Billing
```

**Workspaces:**
- User has `allowedWorkspaces: string[]`
- Navigation filtered by workspace access
- Server actions verify permissions

**Row Level Security (RLS):**
- Database-level access control
- Policies based on `hospital_id`
- User can only access their hospital's data

### Security Checklist

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth middleware | ✅ | All routes protected |
| Server action auth | ✅ | User check in each action |
| RLS policies | ✅ | Database-level enforcement |
| XSS protection | ✅ | React escapes by default |
| CSRF protection | ✅ | Next.js handles automatically |
| Environment secrets | ✅ | .env.local (protected) |

---

## 🎨 Styling / Design System Summary

### Color Palette

**Primary:**
- Light mode: `#0e7a91` → `#2ab3cc`
- Dark mode: `#2ab3cc`

**Background:**
- Light: `#eef5ff` (soft blue-white)
- Dark: `#080f1a` (deep navy)

**Semantic:**
- Success: `#1e8a52` / `#34a86b`
- Warning: `#c47e10` / `#f0c878`
- Error: `#e03620` / `#f97362`

### Typography

- **Primary:** DM Sans (Google Fonts)
- **Monospace:** JetBrains Mono (Google Fonts)
- **Headings:** Tight letter-spacing (-0.025em)

### Spacing Scale

**Border Radius:**
- Base: `--radius: 0.95rem` (~15px)
- Cards: `rounded-xl` (~12px) or custom `rounded-[1.35rem]` (~21px)

**Shadows:**
- Card: `shadow-[0_10px_28px_rgba(13,27,42,0.035)]`
- Elevated: `shadow-[0_14px_34px_rgba(13,27,42,0.06)]`

### Key Design Patterns

1. **Surface Panel:** Rounded cards with subtle shadows
2. **Hero Mesh:** Multi-gradient backgrounds for landing
3. **Eyebrow:** Small uppercase labels with tracking
4. **Stat Cards:** Gradient icon backgrounds with hover lift
5. **Sidebar:** Dark navy with light text (consistent in both modes)

---

## 📁 Important File Map

### Critical Entry Points

| File | Purpose | Change Risk |
|------|---------|-------------|
| `src/app/layout.tsx` | Root layout, fonts | High |
| `src/app/page.tsx` | Landing page | Medium |
| `src/app/(hospital)/h/[hospitalSlug]/layout.tsx` | Hospital data loader | High |
| `middleware.ts` | Auth session refresh | High |

### Core Infrastructure

| File | Purpose | Change Risk |
|------|---------|-------------|
| `src/lib/supabase/server.ts` | Server client | High |
| `src/lib/supabase/middleware.ts` | Session handling | High |
| `src/lib/auth/session.ts` | Auth helpers | Medium |
| `src/lib/auth/workspaces.ts` | Permissions | Medium |
| `src/components/layout/hospital-shell.tsx` | Main shell | High |

### Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies |
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `components.json` | shadcn/ui config |
| `src/app/globals.css` | Global styles, theme |

---

## 🔄 Critical Workflows

### 1. Patient Registration Flow

```
Front Desk → Search Patient → New/Existing → Create Visit → Queue
    ↓
Doctor Workspace ←── Patient Queue ←──┘
```

### 2. Clinical Encounter Flow

```
Doctor → Patient → Create Encounter → Lab Orders / Prescriptions
    ↓
Laboratory / Pharmacy ←── Orders ←──┘
    ↓
Results / Dispensing → Back to Doctor
    ↓
Discharge / Admission
```

### 3. Billing Flow

```
Services Rendered → Auto-create Invoice Items → Invoice
    ↓
Payment Recording → Receipt
```

### 4. Admission Flow

```
Doctor Request → Ward Admission → Bed Assignment
    ↓
Nursing Care → Vitals → Notes
    ↓
Discharge Checklist → Finalize
```

---

## ⚠️ Known Risks / Technical Debt

### High Risk

| Issue | Impact | Mitigation |
|-------|--------|------------|
| No error boundaries | App crash on unexpected errors | Add error.tsx files |
| Backup files in repo | Code confusion | Delete .bak_* files |
| No tests | Regression risk | Add test suite |

### Medium Risk

| Issue | Impact | Mitigation |
|-------|--------|------------|
| Complex class strings | Maintainability | Extract to constants |
| No optimistic updates | Perceived slowness | Add useOptimistic |
| Mixed radius values | Inconsistency | Standardize tokens |

### Low Risk

| Issue | Impact | Mitigation |
|-------|--------|------------|
| Empty directories | Clutter | Remove unused folders |
| Unused Sonner dep | Bundle size | Remove or use |
| No PWA manifest | Mobile experience | Add manifest.json |

---

## 🛡️ Safe Change Guidelines

### DO

✅ Add new features in `features/{name}/` with standard subdirectories  
✅ Follow existing Server Action patterns exactly  
✅ Use `cn()` for class merging  
✅ Add Zod schemas for all form inputs  
✅ Test navigation with different workspace access  
✅ Revalidate paths after mutations  

### DON'T

❌ Modify HospitalShell without testing all role combinations  
❌ Change CSS variables without checking both light/dark modes  
❌ Skip auth checks in Server Actions  
❌ Use `any` types  
❌ Add new dependencies without review  
❌ Modify middleware matcher without testing static files  

### BE CAREFUL

⚠️ Changes to `globals.css` - affects entire app  
⚠️ Changes to auth utilities - affects all access control  
⚠️ Changes to Supabase client - affects all data operations  
⚠️ Schema changes - may require database migration  

---

## 📖 Recommended Reading Order For Future AI

1. **Start Here**
   - `package.json` - Understand dependencies
   - `src/app/globals.css` - Understand styling system
   - `src/lib/utils.ts` - Core utility

2. **Understand Architecture**
   - `src/app/layout.tsx` - Root layout
   - `src/components/layout/hospital-shell.tsx` - Main shell
   - `src/app/(hospital)/h/[hospitalSlug]/layout.tsx` - Data loading

3. **Understand Data Flow**
   - `src/lib/supabase/server.ts` - Server client
   - `src/lib/auth/session.ts` - Auth pattern
   - Any `features/{name}/actions/*.ts` - Action pattern
   - Any `features/{name}/server/*.ts` - Query pattern

4. **Understand UI Patterns**
   - `src/components/ui/card.tsx` - Component structure
   - `src/components/ui/button.tsx` - CVA pattern
   - `src/components/layout/workspace-stat-card.tsx` - Custom component

5. **Explore Features**
   - `src/features/frontdesk/` - Example feature module
   - `src/features/billing/` - Another example

---

## 📝 Glossary of Important Project Terms

| Term | Meaning |
|------|---------|
| **Hospital** | A tenant in the multi-tenant system |
| **Workspace** | Functional area (doctor, nurse, lab, etc.) |
| **Encounter** | A clinical visit/consultation |
| **Admission** | Inpatient stay |
| **Round** | Doctor's ward visit |
| **Shell** | Layout wrapper with navigation |
| **Stat Card** | KPI/metric display component |
| **Eyebrow** | Small uppercase label |
| **Surface Panel** | Styled card container |
| **CVA** | class-variance-authority (variant management) |
| **cn()** | clsx + tailwind-merge utility |
| **Server Action** | Next.js server-side function |
| **RLS** | Row Level Security (Supabase) |

---

## 🔗 Related Documentation

- `00-project-structure.md` - Detailed file tree
- `01-tech-stack-config.md` - Configuration details
- `02-component-inventory.md` - Component catalog
- `03-source-code-analysis.md` - Code walkthrough
- `04-styling-analysis.md` - Design system
- `05-assets-media.md` - Static assets

---

## ✅ Final Checklist for New AI

Before making changes:

- [ ] Read this master context completely
- [ ] Understand the feature module pattern
- [ ] Review similar existing code
- [ ] Test in both light and dark modes
- [ ] Test with different user roles
- [ ] Run `npm run lint` before committing
- [ ] Verify TypeScript compilation

---

**End of Master Context**

*This document was generated by analyzing the actual MPG Care Hub codebase. All information is confirmed from source files unless explicitly marked as inferred.*
