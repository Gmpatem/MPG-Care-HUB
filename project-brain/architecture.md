# MPG Care Hub - System Architecture

## Overview
This document defines the structural organization, role hierarchy, and module layout of the MPG Care Hub system.

---

## Organizational Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                      UNION LEVEL                         │
│            (Strategic oversight, policies)               │
│         Access: Private dashboards, aggregated data       │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   Conference A  Conference B  Conference C
   (Regional admin)            (Regional admin)
        │
        ├────────────┬────────────┐
        │            │            │
   District 1   District 2   District 3
        │
        ├────────────┬────────────┐
        │            │            │
   Church A     Church B     Church C
   (Local admin) (Local admin) (Local admin)
        │
   ┌────┴────┐
   │         │
Members   Departments
```

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

| Level | Role | Scope | Key Permissions |
|-------|------|-------|-----------------|
| 1 | `super_admin` | System-wide | Full platform control, user management |
| 2 | `union_officer` | Union | Union dashboards, conference oversight |
| 3 | `conference_officer` | Conference | Conference dashboards, district oversight |
| 4 | `district_director` | District | District dashboards, church oversight |
| 5 | `church_admin` | Church | Full church management |
| 6 | `church_clerk` | Church | Member management, records |
| 7 | `treasurer` | Church | Financial records (church-only) |
| 8 | `department_head` | Department | Department members, activities |
| 9 | `pastor` | Church | Pastoral care, member access |
| 10 | `elder` | Church | Limited pastoral access |
| 11 | `member` | Self | Personal profile, events |

### Permission Matrix

| Feature | Member | Dept Head | Clerk | Admin | Pastor | Treasurer | District | Conf | Union |
|---------|--------|-----------|-------|-------|--------|-----------|----------|------|-------|
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View members | ❌ | Dept only | ✅ | ✅ | ✅ | ❌ | Aggregate | Aggregate | Aggregate |
| Edit members | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Department mgmt | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Treasury | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Events | View | Manage | Manage | Manage | View | View | View | View | View |
| Reports | ❌ | Dept | Church | Church | Church | Church | District | Conf | Union |
| Announcements | View | Create | Create | Create | Create | View | Create | Create | Create |
| **Higher dashboards** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## Module Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages
│   │   ├── page.tsx              # Landing page
│   │   ├── login/
│   │   └── accept-invite/
│   │
│   ├── (platform)/               # Platform-level access
│   │   └── platform/
│   │       └── hospitals/        # Church management (renamed)
│   │           ├── page.tsx      # Church list
│   │           ├── [id]/
│   │           └── new/
│   │
│   ├── (church)/                 # Church-level workspace
│   │   └── c/[churchSlug]/       # Church workspace
│   │       ├── page.tsx          # Church dashboard
│   │       ├── members/
│   │       ├── departments/
│   │       ├── events/
│   │       ├── announcements/
│   │       ├── treasury/
│   │       ├── reports/
│   │       └── admin/
│   │
│   ├── (oversight)/              # HIGHER-LEVEL DASHBOARDS
│   │   ├── district/             # District director access
│   │   │   └── [districtId]/
│   │   ├── conference/           # Conference officer access
│   │   │   └── [conferenceId]/
│   │   └── union/                # Union officer access
│   │       └── [unionId]/
│   │
│   └── api/                      # API routes
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn components
│   └── layout/                   # Layout components
│
├── features/                     # Feature-based modules
│   ├── auth/                     # Authentication
│   ├── members/                  # Member management
│   ├── departments/              # Department management
│   ├── events/                   # Events & calendar
│   ├── announcements/            # Communications
│   ├── treasury/                 # Finance
│   ├── reports/                  # Reporting & analytics
│   ├── complaints/               # Requests & grievances
│   └── oversight/                # Higher-level dashboards
│       ├── district/
│       ├── conference/
│       └── union/
│
├── lib/                          # Utilities
│   ├── auth/                     # Auth guards, permissions
│   ├── db/                       # Database types, helpers
│   ├── supabase/                 # Supabase clients
│   └── utils/                    # General utilities
│
└── types/                        # Global TypeScript types
```

---

## Database Schema Overview

### Core Tables

```sql
-- Organizational Hierarchy
organizations (id, name, type, parent_id, level)
- type: 'church', 'district', 'conference', 'union'

-- Users & Roles
users (id, email, profile_data)
user_roles (id, user_id, organization_id, role)

-- Members (church-specific)
members (id, church_id, user_id, status, baptism_date, ...)

-- Departments
departments (id, church_id, name, head_id, ...)
department_members (id, department_id, member_id, role)

-- Events
events (id, church_id, title, date, type, ...)
event_attendance (id, event_id, member_id, attended)

-- Treasury
transactions (id, church_id, type, amount, category, ...)
-- RLS: Only church-level roles can access

-- Complaints & Requests
requests (id, church_id, type, status, anonymous, ...)
```

---

## Security Model

### Row Level Security (RLS) Policies

1. **Organization Isolation**
   - All data scoped to organization_id
   - Users can only access data from their assigned organizations

2. **Role Enforcement**
   - Database policies check user_roles table
   - Higher-level access granted via explicit role checks

3. **Higher-Level Dashboard Security**
   - Routes protected by role middleware
   - District/Conference/Union pages check role before rendering
   - Database queries aggregate only from child organizations

### Middleware Guards

```typescript
// Example route protection
const requireOversightAccess = (level: 'district' | 'conference' | 'union') => {
  // Check user has appropriate role
  // Redirect to unauthorized if not
}
```

---

## Integration Points

### External Services
- **Email:** SendGrid/AWS SES for invitations, notifications
- **SMS:** Twilio (planned) for urgent announcements
- **Storage:** Supabase Storage for documents, photos
- **Analytics:** Plausible or similar (privacy-focused)

### APIs
- RESTful API routes for mobile app (future)
- Webhook support for third-party integrations

---

## Scalability Considerations

1. **Database**
   - Indexed queries on organization_id, role lookups
   - Read replicas for reporting queries
   - Connection pooling

2. **Frontend**
   - Code splitting by feature
   - Lazy loading for dashboard widgets
   - Pagination on all list views

3. **Caching**
   - React Query for server state
   - SSG for marketing pages
   - ISR for semi-static content
