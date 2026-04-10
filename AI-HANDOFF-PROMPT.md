# AI Handoff Prompt - MPG Care Hub

**Use this prompt when starting work with any AI assistant on this project.**

---

## Quick Start for AI Assistants

You are working on **MPG Care Hub**, an SDA Church Management System built with Next.js, TypeScript, and Supabase. This is a production application with strict security requirements.

### BEFORE YOU WRITE ANY CODE:

1. **Read the project-brain files** (in this order):
   ```
   /project-brain/context.md       → Product overview and goals
   /project-brain/architecture.md  → System structure and RBAC
   /project-brain/decisions.md     → Technical decisions
   /project-brain/current-task.md  → What we're building now
   /project-brain/changelog.md     → Recent changes
   /project-brain/system-rules.md  → Rules you MUST follow
   ```

2. **Summarize your understanding** before proceeding:
   - What is the project?
   - What are we currently building?
   - What are the key constraints?

---

## Critical Rules (Read system-rules.md for details)

| Rule | Summary |
|------|---------|
| **Rule 1** | Always read project-brain first |
| **Rule 2** | Never break RBAC - check permissions always |
| **Rule 3** | Never expose oversight dashboards to normal users |
| **Rule 4** | Update changelog after major work |
| **Rule 5** | Keep UI mobile-friendly and modular |
| **Rule 6** | Follow naming conventions |
| **Rule 7** | Maintain type safety (no `any`) |
| **Rule 8** | Respect privacy boundaries |
| **Rule 9** | Document breaking changes |
| **Rule 10** | When in doubt, ask |

---

## Project Quick Reference

### Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel

### Key Directories
```
src/
├── app/              # Next.js routes
│   ├── (marketing)/  # Public pages
│   ├── (platform)/   # Platform admin
│   ├── (church)/     # Church workspace (main app)
│   └── (oversight)/  # District/Conference/Union dashboards (RESTRICTED)
├── features/         # Feature-based modules
├── components/       # Shared UI
└── lib/              # Utilities, auth, database
```

### Role Hierarchy
```
super_admin > union_officer > conference_officer > district_director > 
church_admin > church_clerk > treasurer/department_head/pastor/elder > member
```

### Current Focus
Building secure higher-level oversight dashboards that are completely inaccessible to normal church users.

---

## Self-Check Before Coding

```markdown
[ ] I've read all project-brain files
[ ] I understand the current task
[ ] I know which roles can access what
[ ] My changes won't break existing functionality
[ ] My code will work on mobile
[ ] I'll update the changelog when done
```

---

## When You're Done

1. Test your changes locally
2. Update `/project-brain/changelog.md` with your changes
3. Summarize what you did and what's next
4. Note any blockers or questions

---

## Need Help?

If you're unsure about:
- The architecture → Read architecture.md
- Security requirements → Read system-rules.md Rule 2 & 3
- What's being built → Read current-task.md
- How something should work → Ask before assuming

---

**Remember:** This is a secure, multi-tenant application handling sensitive church data. Security and privacy are paramount.

---

*Last updated: April 11, 2025*
