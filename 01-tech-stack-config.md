# ⚙️ Tech Stack and Configuration

**Generated:** 2026-04-07  
**Status:** Confirmed from actual codebase

---

## Package.json Analysis

```json
{
  "name": "mpg-care-hub",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@supabase/ssr": "^0.9.0",
    "@supabase/supabase-js": "^2.98.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.36.0",
    "lucide-react": "^0.577.0",
    "next": "16.1.6",
    "nprogress": "^0.2.0",
    "radix-ui": "^1.4.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.71.2",
    "shadcn": "^4.0.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Framework and Runtime

| Component | Technology | Version | Status |
|-----------|------------|---------|--------|
| Framework | Next.js | 16.1.6 | Confirmed |
| React | React | 19.2.3 | Confirmed |
| React DOM | React DOM | 19.2.3 | Confirmed |
| Runtime | Node.js | (implied) | Inferred |
| Language | TypeScript | 5.x | Confirmed |

### Next.js Configuration

**File:** `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

**Status:** Minimal configuration - using Next.js defaults

---

## UI and Styling Stack

| Component | Technology | Purpose | Status |
|-----------|------------|---------|--------|
| CSS Framework | Tailwind CSS | v4.0 | Confirmed |
| Tailwind Plugin | @tailwindcss/postcss | v4 processing | Confirmed |
| Animation | tw-animate-css | Tailwind animations | Confirmed |
| Class Utilities | tailwind-merge + clsx | Class merging | Confirmed |
| Variants | class-variance-authority (CVA) | Component variants | Confirmed |
| UI Primitives | radix-ui | Headless UI | Confirmed |
| shadcn/ui | shadcn | Component system | Confirmed |
| Icons | lucide-react | Icon library | Confirmed |

### PostCSS Configuration

**File:** `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**Note:** Using Tailwind CSS v4 with the new PostCSS plugin architecture

### shadcn/ui Configuration

**File:** `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

**Key Settings:**
- Style: `radix-nova` (modern variant)
- React Server Components: Enabled
- CSS Variables: Enabled (theming)
- Base Color: Neutral
- Icons: Lucide

---

## Backend and Data

| Component | Technology | Purpose | Status |
|-----------|------------|---------|--------|
| Database | Supabase PostgreSQL | Primary database | Confirmed |
| Auth | Supabase Auth | Authentication | Confirmed |
| Server Client | @supabase/ssr | Server-side Supabase | Confirmed |
| Client | @supabase/supabase-js | Browser client | Confirmed |

### Supabase Integration

**Files:**
- `src/lib/supabase/server.ts` - Server component client
- `src/lib/supabase/browser.ts` - Browser client
- `src/lib/supabase/middleware.ts` - Middleware session handling

**Pattern:** Uses `@supabase/ssr` for cookie-based session management in Next.js App Router

---

## Form Handling

| Component | Technology | Purpose | Status |
|-----------|------------|---------|--------|
| Form Library | react-hook-form | Form state management | Confirmed |
| Validation | zod | Schema validation | Confirmed |
| Resolver | @hookform/resolvers | Zod integration | Confirmed |

**Usage Pattern:**
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
```

---

## Animation

| Component | Technology | Purpose | Status |
|-----------|------------|---------|--------|
| Animation | framer-motion | React animations | Confirmed (installed) |
| Progress | nprogress | Route progress bar | Confirmed (installed) |

**Note:** Framer Motion is installed but usage is minimal in current codebase. Custom toast system preferred over Sonner despite installation.

---

## Date and Utilities

| Component | Technology | Purpose | Status |
|-----------|------------|---------|--------|
| Dates | date-fns | Date manipulation | Confirmed |
| Commands | cmdk | Command palette | Confirmed (installed) |

---

## TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"],
  "exclude": ["node_modules"]
}
```

**Key Settings:**
- Target: ES2017
- Strict mode: Enabled
- JSX: react-jsx transform
- Path alias: `@/*` → `./src/*`
- Module resolution: bundler

---

## Linting

**File:** `eslint.config.mjs`

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals")];

export default eslintConfig;
```

**Configuration:** Standard Next.js ESLint with `next/core-web-vitals`

---

## Middleware

**File:** `middleware.ts`

```typescript
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

**Purpose:** Session management for Supabase Auth
**Pattern:** Excludes static files and images from middleware processing

---

## Environment Variables

**Status:** Documented from code references only (values not exposed)

### Required Variables

| Variable | Found In | Purpose | Required |
|----------|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase/server.ts`, `browser.ts` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase/server.ts`, `browser.ts` | Supabase anonymous key | Yes |

### Variable Usage Analysis

```typescript
// From src/lib/supabase/server.ts
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```

**Note:** Both variables use `NEXT_PUBLIC_` prefix, making them available in browser. This is standard for Supabase client-side usage.

### Security Considerations

- **No server-only secrets detected** in code analysis
- **No database connection strings** visible (managed by Supabase)
- **No API keys** for external services found
- Environment file (`.env.local`) exists but contents are protected

---

## Runtime Architecture Snapshot

```
┌─────────────────────────────────────────────────────────────────┐
│                     RUNTIME ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │   Next.js 16    │────▶│  React 19 RSC   │                   │
│  │   App Router    │     │   + Client      │                   │
│  └─────────────────┘     └─────────────────┘                   │
│           │                           │                         │
│           ▼                           ▼                         │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │  Tailwind CSS 4 │     │  Server Actions │                   │
│  │  CSS Variables  │     │  (Mutations)    │                   │
│  └─────────────────┘     └─────────────────┘                   │
│           │                           │                         │
│           └───────────┬───────────────┘                         │
│                       ▼                                         │
│              ┌─────────────────┐                               │
│              │  Supabase       │                               │
│              │  - Auth         │                               │
│              │  - PostgreSQL   │                               │
│              │  - Realtime     │                               │
│              └─────────────────┘                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  KEY PATTERNS:                                                  │
│  • React Server Components by default                           │
│  • Server Actions for mutations                                 │
│  • Cookie-based auth sessions                                   │
│  • Feature-based code organization                              │
│  • shadcn/ui + Tailwind for styling                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Risks / Gaps

| Risk | Severity | Description |
|------|----------|-------------|
| Empty Next.js config | Low | No custom config may miss optimizations |
| No CSP headers | Medium | No Content Security Policy detected |
| Public env vars only | Low | All Supabase vars are public (standard) |
| No error tracking | Medium | No Sentry/LogRocket integration visible |
| No analytics | Low | No Google Analytics/Plausible detected |
| No testing config | Medium | No Jest/Vitest/Playwright config |
| Backup files | Low | .bak files in repo should be cleaned |

---

## Missing but Expected Configs

| Config | Status | Priority |
|--------|--------|----------|
| `.env.example` | Not found | High - needed for onboarding |
| `Dockerfile` | Not found | Medium - for deployment |
| `docker-compose.yml` | Not found | Low - optional |
| Testing config | Not found | Medium - Jest/Vitest |
| CI/CD config | Not found | Medium - GitHub Actions |
| Prettier config | Not found | Low - optional |
| VSCode settings | Not found | Low - optional |

---

## Summary Table

| Category | Technology | Confidence |
|----------|------------|------------|
| Framework | Next.js 16 + React 19 | 100% |
| Language | TypeScript 5 | 100% |
| Styling | Tailwind CSS v4 | 100% |
| UI System | shadcn/ui + Radix | 100% |
| Backend | Supabase | 100% |
| Auth | Supabase Auth + RBAC | 100% |
| Forms | React Hook Form + Zod | 100% |
| State | Server Components only | 95% |
| Testing | None detected | 100% |
| Deployment | Not configured | 100% |
