# MPG Care Hub - System Rules for AI Contributors

This document defines strict rules and guidelines for all AI assistants (Kimi, Claude, Codex, etc.) working on the MPG Care Hub project.

**Version:** 1.0  
**Effective:** April 11, 2025  
**Applies To:** All AI assistants and automated tools

---

## Rule 1: Always Read Project-Brain First

### Requirement
Before making ANY changes to code, configuration, or documentation, you MUST:

1. Read all files in `/project-brain/` directory:
   - `context.md` - Understand the product
   - `architecture.md` - Understand the structure
   - `decisions.md` - Know the established patterns
   - `current-task.md` - Know what's being worked on
   - `changelog.md` - Know recent changes
   - `system-rules.md` - Know these rules

2. Summarize your understanding before proceeding

### Why
- Prevents context loss between AI sessions
- Maintains consistency across different AI tools
- Avoids contradicting established decisions

### Checklist
```
[ ] Read context.md
[ ] Read architecture.md
[ ] Read decisions.md
[ ] Read current-task.md
[ ] Read changelog.md
[ ] Read system-rules.md
[ ] Summarize understanding
[ ] Begin work
```

---

## Rule 2: Never Break RBAC

### Requirement
Role-Based Access Control is NON-NEGOTIABLE. You must:

1. **Respect the role hierarchy** defined in architecture.md
2. **Never create backdoors** or bypass authentication
3. **Always check permissions** before exposing data or functionality
4. **Use RLS policies** - don't rely solely on frontend checks

### Forbidden Actions
- ❌ Exposing admin functions to regular users
- ❌ Skipping authentication checks
- ❌ Hardcoding role checks that bypass the system
- ❌ Removing existing permission guards
- ❌ Creating "temporary" admin bypasses

### Required Pattern
```typescript
// Always use the established guard pattern
import { requireRole } from '@/lib/auth/guards';

export default async function AdminPage() {
  const user = await requireRole(['admin', 'church_admin']);
  // ... rest of page
}
```

---

## Rule 3: Never Expose Restricted Dashboards to Normal Users

### Requirement
The oversight dashboards (District, Conference, Union) are STRICTLY RESTRICTED.

### Security Requirements
1. **Route Protection:** All oversight routes MUST check for appropriate role
2. **Database Level:** RLS policies must prevent unauthorized access
3. **No Information Leakage:** Error messages should not reveal existence of restricted data
4. **Audit Trail:** Log access attempts to oversight areas

### Access Matrix
| Route | Allowed Roles | Forbidden Roles |
|-------|---------------|-----------------|
| `/district/*` | `district_director`, `conference_officer`, `union_officer`, `super_admin` | All church-level roles |
| `/conference/*` | `conference_officer`, `union_officer`, `super_admin` | District directors and below |
| `/union/*` | `union_officer`, `super_admin` | Conference officers and below |

### Required Implementation
```typescript
// middleware.ts or layout level
if (!hasRequiredRole(user, requiredRole)) {
  redirect('/unauthorized');
  // NEVER redirect to dashboard or reveal that page exists
}
```

---

## Rule 4: Always Update Changelog After Major Work

### Requirement
After completing significant work, you MUST update `changelog.md`.

### What Constitutes "Major Work"
- New features or modules
- Architecture changes
- Security updates
- Breaking changes
- New API endpoints
- Database schema changes
- New dependencies

### Format
```markdown
## [Unreleased]

### Added
- Description of new feature (Your Name/AI, YYYY-MM-DD)

### Fixed
- Description of bug fix (Your Name/AI, YYYY-MM-DD)
```

### Process
1. Complete your changes
2. Test thoroughly
3. Update `changelog.md` under `[Unreleased]`
4. Summarize changes in your response

---

## Rule 5: Keep UI Mobile-Friendly and Modular

### Mobile-First Requirement
Every UI component MUST work on mobile devices (320px width minimum).

### Mobile Checklist
- [ ] Touch targets minimum 44px × 44px
- [ ] Readable text (minimum 16px for inputs to prevent zoom)
- [ ] Responsive tables (horizontal scroll or card view)
- [ ] Bottom navigation for mobile where appropriate
- [ ] Tested on 320px, 768px, and 1024px viewports

### Modularity Requirement
Code must be organized by feature, not by type.

### Correct Structure
```
features/
  members/
    ├── actions/
    │   └── createMember.ts
    ├── components/
    │   ├── MemberList.tsx
    │   └── MemberForm.tsx
    ├── schemas/
    │   └── member.schema.ts
    └── server/
        └── getMembers.ts
```

### Incorrect Structure
```
components/
  members/
    ├── MemberList.tsx
    └── MemberForm.tsx
actions/
  members.ts
schemas/
  members.ts
```

---

## Rule 6: Follow Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `MemberList.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Server actions: `camelCase.ts` (e.g., `createMember.ts`)
- Constants: `SCREAMING_SNAKE_CASE` or `camelCase.config.ts`

### Database
- Tables: lowercase, plural (e.g., `church_members`)
- Columns: snake_case (e.g., `created_at`)
- Foreign keys: `[table]_id` (e.g., `church_id`)

### CSS/Tailwind
- Custom classes: `kebab-case`
- Component variants: Use cn() utility from existing patterns

---

## Rule 7: Maintain Type Safety

### Requirement
TypeScript strict mode is enabled. All code must be type-safe.

### Rules
1. **No `any` type** - Use `unknown` with type guards if necessary
2. **Explicit return types** for public functions
3. **Zod schemas** for all data validation
4. **Database types** - Use generated Supabase types

### Example
```typescript
// ✅ Good
import { z } from 'zod';

const memberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
});

type Member = z.infer<typeof memberSchema>;

async function getMember(id: string): Promise<Member | null> {
  // Implementation
}

// ❌ Bad
async function getMember(id) {
  // Implementation
}
```

---

## Rule 8: Respect Privacy Boundaries

### Requirement
Financial and personal data have strict privacy boundaries.

### Privacy Rules
1. **Individual giving records:** Church level only, treasurer role only
2. **Member personal info:** Accessible only to church admin, clerk, pastor
3. **Aggregated data only:** At oversight levels (District+)
4. **Anonymous requests:** Never de-anonymize complaint/request data

### Database Query Rule
```typescript
// Always include organization filter
const { data } = await supabase
  .from('members')
  .select('*')
  .eq('church_id', user.churchId); // Never omit this!
```

---

## Rule 9: Document Breaking Changes

### Requirement
If your change breaks existing functionality or APIs, you MUST:

1. Document in `changelog.md` under `### Changed` or `### Removed`
2. Provide migration instructions if applicable
3. Notify about required environment changes
4. Update relevant documentation

---

## Rule 10: When in Doubt, Ask

### Requirement
If you are uncertain about:
- Architecture decisions
- Security implications
- User experience flow
- Database design
- Integration approach

**STOP and ask for clarification** rather than making assumptions.

### Questions to Consider
- Does this align with the existing architecture?
- Am I maintaining the security boundaries?
- Will this work on mobile?
- Have I considered all user roles?
- Is this consistent with existing patterns?

---

## Enforcement

### Self-Check Before Submitting
```markdown
[ ] I read all project-brain files
[ ] I followed the architecture
[ ] I respected RBAC boundaries
[ ] I protected oversight dashboards
[ ] I updated the changelog
[ ] UI works on mobile (320px+)
[ ] Code is modular and typed
[ ] Naming conventions followed
[ ] Privacy boundaries respected
[ ] No breaking changes undocumented
```

### Violation Response
If you realize you violated a rule:
1. Stop current work
2. Document the violation
3. Fix the issue
4. Update changelog
5. Learn for next time

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-04-11 | Initial rules established |

---

**Remember:** These rules exist to maintain quality, security, and consistency. Following them makes you a better collaborator.
