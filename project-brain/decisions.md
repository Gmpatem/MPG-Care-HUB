# MPG Care Hub - Key Decisions Log

This document records significant technical and product decisions made for the MPG Care Hub project.

---

## Architecture Decisions

### ADR-001: Next.js with App Router
**Date:** February 2025  
**Decision:** Use Next.js 14 with App Router as the primary framework.  
**Rationale:**
- Server-side rendering for better SEO and performance
- Built-in API routes for backend functionality
- Simplified deployment on Vercel
- TypeScript-first development

**Alternatives Considered:**
- React with Vite (no SSR benefits)
- SvelteKit (smaller ecosystem)

---

### ADR-002: Supabase for Backend
**Date:** February 2025  
**Decision:** Use Supabase for database, auth, and storage.  
**Rationale:**
- PostgreSQL with Row Level Security for data protection
- Built-in authentication with multiple providers
- Real-time subscriptions (future use)
- Cost-effective for church/non-profit budgets

**Alternatives Considered:**
- Firebase (less flexible query capabilities)
- Custom Node.js backend (higher maintenance overhead)

---

### ADR-003: Role-Based Access Control (RBAC)
**Date:** March 2025  
**Decision:** Implement hierarchical RBAC with 11 distinct roles.  
**Rationale:**
- Church organizational structure requires clear boundaries
- Higher-level oversight needs appropriate data access
- Financial data must be strictly isolated

**Key Principles:**
1. Least privilege - users get minimum access needed
2. Inheritance - oversight roles can view child organization data
3. Explicit grants - no implicit access through hierarchy

---

### ADR-004: Multi-Level Oversight Structure
**Date:** March 2025  
**Decision:** Implement separate route groups for oversight dashboards.  
**Structure:**
```
(church)/c/[slug]/         - Church workspace
(oversight)/
  ├── district/[id]/        - District director view
  ├── conference/[id]/      - Conference officer view
  └── union/[id]/           - Union officer view
```

**Rationale:**
- Clear separation of concerns
- Easier to implement strict access controls
- Different UI needs for oversight vs. operational views

---

### ADR-005: Privacy-First Financial Data
**Date:** March 2025  
**Decision:** Individual giving records are NEVER exposed above church level.  
**Rules:**
1. Church treasurers can see individual records
2. Church admins see aggregated summaries only
3. District/Conference/Union see high-level metrics only
4. No personally identifiable financial data in oversight dashboards

**Rationale:**
- Biblical and ethical standards of stewardship
- Member trust and confidentiality
- Legal compliance with privacy regulations

---

## Technical Decisions

### TD-001: TypeScript Strict Mode
**Date:** February 2025  
**Decision:** Enable TypeScript strict mode with comprehensive type coverage.  
**Impact:**
- Catches errors at compile time
- Better IDE support and autocomplete
- More maintainable codebase

---

### TD-002: shadcn/ui Component Library
**Date:** February 2025  
**Decision:** Use shadcn/ui as the base component library with Tailwind CSS.  
**Rationale:**
- Copy-paste components (full control)
- Built on Radix UI (accessibility)
- Consistent with modern React patterns
- Easy customization for brand

---

### TD-003: Feature-Based Directory Structure
**Date:** February 2025  
**Decision:** Organize code by feature, not by type.  
**Structure:**
```
features/
  members/
    ├── actions/        # Server actions
    ├── components/     # Feature components
    ├── schemas/        # Validation schemas
    └── server/         # Server-side utilities
```

**Rationale:**
- Better code colocation
- Easier to understand feature boundaries
- Simplifies refactoring and maintenance

---

### TD-004: Server Actions for Mutations
**Date:** March 2025  
**Decision:** Use Next.js Server Actions for all data mutations.  
**Rationale:**
- Simplified data flow (no separate API endpoints)
- Built-in CSRF protection
- Progressive enhancement support
- Type-safe from client to server

---

### TD-005: Zod for Validation
**Date:** February 2025  
**Decision:** Use Zod for all form and API validation.  
**Rationale:**
- TypeScript-first schema validation
- Composable and reusable schemas
- Great error messages for users

---

## Product Decisions

### PD-001: Mobile-First Design
**Date:** February 2025  
**Decision:** All features must work on mobile devices first.  
**Guidelines:**
- Touch targets minimum 44px
- Responsive tables with horizontal scroll or card view
- Bottom navigation for mobile
- Offline capability consideration for PWA

---

### PD-002: Modular Feature Rollout
**Date:** March 2025  
**Decision:** Build features as independent modules that can be enabled/disabled.  
**Implementation:**
- Feature flags in configuration
- Self-contained feature directories
- Plugin-style architecture for future extensibility

---

### PD-003: Self-Serve Church Onboarding
**Date:** March 2025  
**Decision:** Churches can be created through self-serve flow with verification.  
**Flow:**
1. User creates account
2. Submits church creation request
3. Automatic creation with verification email
4. Conference review for oversight assignment

---

### PD-004: Announcement Hierarchy
**Date:** March 2025  
**Decision:** Announcements cascade down hierarchy but not up.  
**Rules:**
- Union can announce to all conferences, districts, churches
- Conference can announce to their districts and churches
- Church can announce to their members only
- No upward visibility (church cannot see conference announcements unless targeted)

---

## Naming Conventions

### NC-001: Route Naming
- Church workspace: `/c/[churchSlug]/...`
- Platform admin: `/platform/...`
- Oversight dashboards: `/district/[id]/`, `/conference/[id]/`, `/union/[id]/`

### NC-002: Database Naming
- Table names: lowercase, plural (e.g., `users`, `church_members`)
- Column names: snake_case
- Foreign keys: `[table]_id` (e.g., `church_id`)
- Timestamps: `created_at`, `updated_at`

### NC-003: File Naming
- Components: PascalCase (e.g., `MemberList.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Server actions: camelCase with action suffix (e.g., `createMember.ts`)

---

## Deferred Decisions

### DD-001: Mobile App
**Status:** Deferred to Phase 2  
**Consideration:** React Native vs. PWA vs. Flutter

### DD-002: Real-Time Features
**Status:** Deferred  
**Consideration:** WebSockets via Supabase Realtime for live dashboards

### DD-003: Multi-Language Support
**Status:** Deferred to Phase 3  
**Consideration:** i18n framework and translation workflow

### DD-004: Advanced Analytics
**Status:** Deferred  
**Consideration:** Integration with analytics platforms for insights

---

## Decision Review Schedule

Major architecture decisions should be reviewed:
- When new requirements conflict with existing decisions
- When scaling issues emerge
- Quarterly during technical planning

**Last Review:** April 2025  
**Next Review:** July 2025
