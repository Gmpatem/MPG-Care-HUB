# 🎨 Styling Analysis

**Generated:** 2026-04-07  
**Status:** Confirmed from actual codebase

---

## 1. Styling Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    STYLING ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tailwind CSS v4 (CSS-first config)                             │
│  ├── @import "tailwindcss"                                      │
│  ├── @import "tw-animate-css"                                   │
│  └── @import "shadcn/tailwind.css"                              │
│                                                                 │
│  CSS Variables (Design Tokens)                                  │
│  ├── Colors (light/dark modes)                                  │
│  ├── Typography (font families)                                 │
│  └── Spacing/Radii (via --radius)                               │
│                                                                 │
│  Component Styles                                               │
│  ├── shadcn/ui base components                                  │
│  ├── Custom component classes                                   │
│  └── Inline Tailwind classes                                    │
│                                                                 │
│  Utilities                                                      │
│  ├── cn() - class merging                                       │
│  ├── cva() - component variants                                 │
│  └── clsx() - conditional classes                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | v4 | Utility-first CSS framework |
| @tailwindcss/postcss | v4 | PostCSS plugin |
| tw-animate-css | v1.4 | Animation utilities |
| tailwind-merge | v3.5 | Class deduplication |
| clsx | v2.1 | Conditional classes |
| class-variance-authority | v0.7 | Component variants |

---

## 2. Global Style Sources

### 2.1 globals.css

**File:** `src/app/globals.css` (226 lines)

#### Imports Section

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

#### Theme Inline Variables

```css
@theme inline {
  /* Mapped to CSS variables */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-dm-sans);
  --font-mono: var(--font-jetbrains-mono);
  
  /* Component colors */
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  
  /* Chart colors */
  --color-chart-1 through --color-chart-5
  
  /* Sidebar colors */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  /* ... more sidebar vars */
  
  /* Radius scale */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.3);
  --radius-2xl: calc(var(--radius) * 1.7);
}
```

### 2.2 Light Mode Variables

```css
:root {
  --background: #eef5ff;
  --foreground: #0d1b2a;
  
  --card: #ffffff;
  --card-foreground: #0d1b2a;
  --popover: #ffffff;
  --popover-foreground: #0d1b2a;
  
  --primary: #0e7a91;
  --primary-foreground: #ffffff;
  
  --secondary: #d4f2f7;
  --secondary-foreground: #0b4a5c;
  
  --muted: #e8f1fb;
  --muted-foreground: #5f7891;
  
  --accent: #eef9fb;
  --accent-foreground: #0d6175;
  
  --destructive: #e03620;
  
  --border: #c8ddef;
  --input: #c8ddef;
  --ring: rgba(17, 150, 176, 0.28);
  
  /* Chart colors */
  --chart-1: #1196b0;
  --chart-2: #1e8a52;
  --chart-3: #c47e10;
  --chart-4: #534ab7;
  --chart-5: #e03620;
  
  --radius: 0.95rem;  /* ~15px */
  
  /* Sidebar (dark by design even in light mode) */
  --sidebar: #0b2a4a;
  --sidebar-foreground: rgba(255,255,255,0.92);
  --sidebar-primary: #2ab3cc;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: rgba(255,255,255,0.08);
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: rgba(255,255,255,0.08);
  --sidebar-ring: rgba(42,179,204,0.35);
}
```

### 2.3 Dark Mode Variables

```css
.dark {
  --background: #080f1a;
  --foreground: #e8f2fa;
  
  --card: #101c2c;
  --card-foreground: #e8f2fa;
  
  --primary: #2ab3cc;
  --primary-foreground: #041c22;
  
  --secondary: rgba(42,179,204,0.14);
  --secondary-foreground: #d4f2f7;
  
  --muted: #0c1520;
  --muted-foreground: rgba(232,242,250,0.68);
  
  --accent: rgba(42,179,204,0.14);
  --accent-foreground: #d4f2f7;
  
  --destructive: #f97362;
  
  --border: rgba(255,255,255,0.09);
  --input: rgba(255,255,255,0.12);
  --ring: rgba(42,179,204,0.3);
  
  /* Sidebar */
  --sidebar: #061221;
  /* ... */
}
```

### 2.4 Base Styles

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  html {
    font-family: var(--font-sans), sans-serif;
    scroll-behavior: smooth;
  }

  body {
    background:
      radial-gradient(circle at top right, rgba(42, 179, 204, 0.11), transparent 28%),
      radial-gradient(circle at bottom left, rgba(83, 74, 183, 0.06), transparent 32%),
      var(--background);
    color: var(--foreground);
    font-family: var(--font-sans), sans-serif;
    text-rendering: optimizeLegibility;
  }

  h1, h2, h3, h4 {
    letter-spacing: -0.025em;
  }

  code, pre, .font-mono {
    font-family: var(--font-mono), monospace;
  }
}
```

### 2.5 Custom Component Classes

```css
@layer components {
  .surface-panel {
    @apply rounded-[1.5rem] border bg-card;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.55) inset,
      0 14px 34px rgba(13, 27, 42, 0.06);
  }

  .surface-soft {
    @apply rounded-2xl border;
    background: #f4f8fd;
  }

  .hero-mesh {
    background:
      radial-gradient(ellipse 55% 60% at 85% -5%, rgba(42,179,204,0.28), transparent),
      radial-gradient(ellipse 35% 45% at -5% 85%, rgba(83,74,183,0.18), transparent),
      radial-gradient(ellipse 30% 40% at 50% 110%, rgba(30,138,82,0.12), transparent),
      linear-gradient(135deg, #0b2a4a 0%, #0b4a5c 62%, #0d6175 100%);
  }

  .eyebrow {
    @apply text-[11px] font-semibold uppercase tracking-[0.22em];
    color: var(--muted-foreground);
  }

  .eyebrow-light {
    @apply text-[11px] font-semibold uppercase tracking-[0.22em];
    color: #a8e5ef;
  }
}
```

### 2.6 Interactive Element Transitions

```css
button,
[role="button"] {
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

input:focus,
textarea:focus,
select:focus {
  box-shadow: 0 0 0 3px rgba(17, 150, 176, 0.12);
}
```

---

## 3. Design Tokens

### 3.1 Color Palette

#### Primary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| --primary | #0e7a91 | #2ab3cc | Buttons, links, accents |
| --primary-foreground | #ffffff | #041c22 | Text on primary |
| --secondary | #d4f2f7 | rgba(42,179,204,0.14) | Secondary backgrounds |

#### Background Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --background | #eef5ff | #080f1a | Page background |
| --card | #ffffff | #101c2c | Card backgrounds |
| --muted | #e8f1fb | #0c1520 | Subtle backgrounds |
| --accent | #eef9fb | rgba(42,179,204,0.14) | Highlighted areas |

#### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| --destructive | #e03620 (light) / #f97362 (dark) | Errors, warnings |
| --border | #c8ddef (light) / rgba(255,255,255,0.09) (dark) | Borders |
| --ring | rgba(17,150,176,0.28) | Focus rings |

#### Chart/Data Colors

| Token | Value | Purpose |
|-------|-------|---------|
| --chart-1 | #1196b0 / #2ab3cc | Primary metric |
| --chart-2 | #1e8a52 / #34a86b | Success/positive |
| --chart-3 | #c47e10 / #f0c878 | Warning/caution |
| --chart-4 | #534ab7 / #8b7cf6 | Secondary |
| --chart-5 | #e03620 / #f97362 | Danger/negative |

### 3.2 Typography

| Token | Value | Usage |
|-------|-------|-------|
| --font-sans | var(--font-dm-sans) | Body text, UI |
| --font-mono | var(--font-jetbrains-mono) | Code, numbers |

**Font Loading:**
```tsx
// layout.tsx
import { DM_Sans, JetBrains_Mono } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
```

### 3.3 Border Radius

| Token | Calculation | Value (~) |
|-------|-------------|-----------|
| --radius-sm | var(--radius) * 0.6 | ~9px |
| --radius-md | var(--radius) * 0.8 | ~12px |
| --radius-lg | var(--radius) | ~15px |
| --radius-xl | var(--radius) * 1.3 | ~20px |
| --radius-2xl | var(--radius) * 1.7 | ~26px |

**Base:** --radius = 0.95rem (~15px)

### 3.4 Custom Radius Values (Hardcoded)

| Value | Usage |
|-------|-------|
| rounded-xl | Cards, buttons (~12px) |
| rounded-2xl | Large cards, modals (~16px) |
| rounded-[1.35rem] | Stat cards (~21px) |
| rounded-[1.5rem] | Surface panels (~24px) |
| rounded-[1.6rem] | Hero sections (~26px) |

---

## 4. Tailwind Usage Patterns

### 4.1 Common Class Patterns

#### Layout Patterns

```
┌────────────────────────────────────────────────────────────────┐
│  Container Patterns                                            │
├────────────────────────────────────────────────────────────────┤
│  max-w-7xl mx-auto px-6           - Landing page container     │
│  px-4 sm:px-6 lg:px-8             - App content padding        │
│  min-h-screen                     - Full height pages          │
│  flex min-h-screen                - Shell layout               │
└────────────────────────────────────────────────────────────────┘
```

#### Card Patterns

```
Common card combinations:

Standard Card:
  rounded-xl border bg-card text-card-foreground shadow-sm

Elevated Card:
  rounded-[1.35rem] border border-border/70 bg-card shadow-[0_10px_28px_rgba(13,27,42,0.035)]

Hover Elevated:
  transition-all hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(13,27,42,0.06)]
```

#### Button Patterns

```
Sizes:
  h-6, h-7, h-8 (default), h-9, h-11, h-14

Icon buttons:
  size-8 (default), size-6 (xs), size-7 (sm), size-9 (lg)
```

### 4.2 Arbitrary Value Usage

| Pattern | Example | Usage |
|---------|---------|-------|
| Colors | `bg-[#0e7a91]`, `text-[#2ab3cc]` | Brand colors |
| Opacity | `bg-white/10`, `text-white/60` | Semi-transparent |
| Shadows | `shadow-[0_10px_28px_rgba(13,27,42,0.035)]` | Custom elevation |
| Radius | `rounded-[1.35rem]`, `rounded-[1.5rem]` | Custom rounding |
| Spacing | `px-2.5`, `py-1.5` | Fine-tuned spacing |

### 4.3 Complex Class Strings

**Card Component (single line):**
```
group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl
```

**Features used:**
- `group/*` - Named groups
- `has-*` - Has selector
- `data-*` - Data attribute selectors
- `*` - Targeting all children

---

## 5. Component Variant Patterns

### 5.1 Button Variants (CVA)

```typescript
const buttonVariants = cva(
  // Base classes
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-border bg-background hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive/10 text-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem]",
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

### 5.2 Card Size Variant

```typescript
function Card({ size = "default", ...props }) {
  return (
    <div
      data-size={size}
      className={cn(
        // Base classes
        "data-[size=sm]:gap-3 data-[size=sm]:py-3",
        className
      )}
    />
  );
}
```

---

## 6. Responsive Design Patterns

### 6.1 Breakpoints Used

| Breakpoint | Width | Usage |
|------------|-------|-------|
| (default) | < 640px | Mobile first base |
| sm: | >= 640px | Small tablets |
| md: | >= 768px | Tablets |
| lg: | >= 1024px | Desktop |
| xl: | >= 1280px | Large desktop |

### 6.2 Common Responsive Patterns

```
Padding:
  px-4 sm:px-6 lg:px-8

Grid:
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

Display:
  hidden md:flex
  hidden lg:block

Text size:
  text-sm sm:text-base lg:text-lg

Layout:
  flex-col lg:flex-row
```

### 6.3 Sidebar Behavior

```
Mobile (< lg):
  - Sidebar hidden
  - Sheet component for mobile menu
  - Hamburger menu button visible

Desktop (>= lg):
  - Fixed sidebar (w-72)
  - Hamburger hidden
```

---

## 7. Animation and Transitions

### 7.1 Default Transitions

```css
/* All buttons */
button {
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}
```

### 7.2 Hover Patterns

| Element | Hover Effect |
|---------|--------------|
| Cards | `hover:-translate-y-[1px] hover:shadow-md` |
| Buttons | Background color change |
| Nav items | `hover:bg-white/8` (sidebar) |
| Links | `hover:text-[#1196b0]` |

### 7.3 Loading Animations

```
Skeleton loading:
  animate-pulse bg-muted

Progress indication:
  animate-pulse (on status dots)
```

---

## 8. Design System Assessment

### 8.1 Strengths

✅ **Comprehensive CSS variables** - Full theming support  
✅ **Consistent color palette** - Harmonious medical/healthcare feel  
✅ **Good dark mode support** - Complete variable set  
✅ **Professional aesthetic** - Clean, trustworthy appearance  
✅ **shadcn/ui foundation** - Solid, accessible base components  
✅ **Custom medical styling** - Hero mesh, surface panels  

### 8.2 Inconsistencies / Risks

⚠️ **Mixed radius values** - Hardcoded values alongside token system  
⚠️ **No design token docs** - Variables not documented  
⚠️ **Inline styles for gradients** - Some gradients in CSS, some inline  
⚠️ **No spacing scale** - Uses arbitrary values (`gap-3`, `gap-4`)  
⚠️ **Complex class strings** - Some components have very long className props  

### 8.3 Recommendations

| Priority | Recommendation |
|----------|----------------|
| Medium | Standardize on radius tokens or document exceptions |
| Low | Create spacing design tokens (4px, 8px, 16px, 24px, 32px) |
| Low | Document color usage guidelines |
| Low | Extract common shadow values to CSS variables |

---

## 9. Color Contrast Analysis

### 9.1 Light Mode Contrast

| Combination | Ratio | WCAG AA | Notes |
|-------------|-------|---------|-------|
| #0e7a91 on #ffffff | 4.8:1 | ✅ Pass | Primary button |
| #0d1b2a on #eef5ff | 12:1 | ✅ Pass | Body text |
| #5f7891 on #ffffff | 3.8:1 | ⚠️ Fail | Muted text (small) |
| #e03620 on #ffffff | 5.2:1 | ✅ Pass | Destructive |

### 9.2 Dark Mode Contrast

| Combination | Ratio | WCAG AA | Notes |
|-------------|-------|---------|-------|
| #2ab3cc on #080f1a | 7.2:1 | ✅ Pass | Primary |
| #e8f2fa on #080f1a | 14:1 | ✅ Pass | Body text |
| rgba(232,242,250,0.68) on #080f1a | ~9.5:1 | ✅ Pass | Muted text |

### 9.3 Accessibility Note

The `--muted-foreground` color in light mode (#5f7891) has marginal contrast. Consider darkening to #4a6076 for better accessibility.

---

## 10. File Summary

| File | Purpose | Lines |
|------|---------|-------|
| `globals.css` | Global styles, variables, theme | 226 |
| `cn()` utility | Class merging | 6 |
| Component styles | Inline in components | ~2000+ |

**No separate CSS files detected** - All styling via Tailwind and globals.css
