# PRD: Technical Architect Design System

## Overview

This document provides a comprehensive specification for implementing the "Technical Architect" design system - a minimal, monospace-first aesthetic with sharp corners and a restrained color palette. This style guide is designed for tool-focused web applications.

---

## 1. Typography

### Font Family

**Primary Font**: Geist Mono (Google Fonts)

```typescript
// Next.js font configuration
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});
```

**CSS Font Stack**:
```css
html, body, * {
  font-family: var(--font-mono), ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}
```

### Font Weights

| Weight | Usage |
|--------|-------|
| `font-medium` (500) | Headers, buttons, emphasized text |
| Regular (400) | Body text, form inputs |

### Font Sizes

| Class | Size | Usage |
|-------|------|-------|
| `text-3xl` | 1.875rem | Page titles, hero headings |
| `text-lg` | 1.125rem | Section headers, component titles |
| `text-sm` | 0.875rem | Body text, buttons, inputs |
| `text-xs` | 0.75rem | Labels, hints, meta information |

### Typography Utilities

#### Mono Label
```css
.mono-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
```

**Usage**: Section labels, category headers, field labels

---

## 2. Color Palette

### Core Colors (CSS Custom Properties)

```css
:root {
  /* Background Colors */
  --bg-primary: #faf9f7;      /* Main background - warm off-white */
  --bg-secondary: #f5f4f2;    /* Cards, inputs, secondary surfaces */
  
  /* Border Colors */
  --grid-lines: #d8d6d3;      /* Subtle grid/separator lines */
  --border-color: #d4d2cf;    /* Primary border color */
  
  /* Text Colors */
  --text-primary: #1a1a1a;    /* Headings, primary text - near black */
  --text-secondary: #555555;  /* Body text, descriptions */
  --text-muted: #888888;      /* Labels, hints, disabled text */
  
  /* Accent Colors */
  --accent-gold: #f5a623;     /* Highlights, decorative elements */
  --accent-ai: #6366f1;       /* Interactive elements, links, focus rings (Indigo) */
  
  /* Semantic Colors */
  --destructive: #dc2626;     /* Errors, delete actions */
}
```

### Tailwind Variable Mappings

```css
:root {
  --background: var(--bg-primary);
  --foreground: var(--text-primary);
  --card: var(--bg-secondary);
  --card-foreground: var(--text-primary);
  --popover: var(--bg-secondary);
  --popover-foreground: var(--text-primary);
  --primary: var(--text-primary);
  --primary-foreground: var(--bg-primary);
  --secondary: var(--bg-secondary);
  --secondary-foreground: var(--text-primary);
  --muted: var(--bg-secondary);
  --muted-foreground: var(--text-muted);
  --accent: var(--bg-secondary);
  --accent-foreground: var(--text-primary);
  --destructive: #dc2626;
  --border: var(--border-color);
  --input: var(--border-color);
  --ring: var(--text-muted);
}
```

### Color Utility Classes

```css
.accent-gold { color: var(--accent-gold); }
.accent-ai { color: var(--accent-ai); }
```

---

## 3. Spacing System

Based on a **24px base unit** with a modular scale:

```css
:root {
  --space-xs: 6px;      /* 1/4 base - tight spacing */
  --space-sm: 12px;     /* 1/2 base - small gaps */
  --space-md: 24px;     /* Base unit - standard spacing */
  --space-lg: 48px;     /* 2x base - section padding */
  --space-xl: 72px;     /* 3x base - large sections */
  --space-2xl: 120px;   /* 5x base - hero/major sections */
  --container-max: 1152px;  /* Maximum content width */
}
```

### Common Spacing Patterns

| Context | Tailwind Classes |
|---------|-----------------|
| Container | `max-w-3xl mx-auto px-6` |
| Section padding | `py-12` or `py-6` |
| Component internal | `p-4` or `p-3` |
| Element gaps | `gap-2`, `gap-3`, `gap-4` |
| Stack spacing | `space-y-2`, `space-y-4`, `space-y-6` |

---

## 4. Border Radius

**All corners are sharp (0 radius)** - This is a key design decision:

```css
:root {
  --radius: 0;
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;
  --radius-2xl: 0;
  --radius-3xl: 0;
  --radius-4xl: 0;
}
```

---

## 5. Button Styles

### Primary Button (Filled)

```tsx
<button className={cn(
  "px-6 py-2 text-sm font-medium transition-colors",
  "bg-[var(--text-primary)] text-[var(--bg-primary)]",
  "hover:bg-[var(--text-secondary)]",
  "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
)}>
  Button Text →
</button>
```

**Disabled State**:
```tsx
"bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
```

### Secondary Button (Outline)

```tsx
<button className={cn(
  "px-4 py-2",
  "border border-[var(--border-color)] bg-[var(--bg-primary)]",
  "hover:bg-[var(--bg-secondary)] transition-colors",
  "flex items-center gap-2 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
)}>
  <Icon className="w-4 h-4" />
  Button Text
</button>
```

### Accent Button (AI/Action)

```tsx
<button className={cn(
  "px-4 py-2",
  "bg-[var(--accent-ai)] text-white",
  "hover:opacity-90 transition-colors",
  "flex items-center gap-2 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
)}>
  <Sparkles className="w-4 h-4" />
  Generate
</button>
```

### Icon Button (Minimal)

```tsx
<button className={cn(
  "p-1",
  "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
  "transition-colors"
)}>
  <X className="w-4 h-4" />
</button>
```

---

## 6. Form Elements

### Text Input

```tsx
<input
  type="text"
  className={cn(
    "w-full px-3 py-2",
    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
    "text-sm",
    "placeholder:text-[var(--text-muted)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
    "transition-colors"
  )}
  placeholder="Placeholder text..."
/>
```

### Alternative Focus Style (Border Only)

```tsx
"focus:outline-none focus:border-[var(--text-muted)]"
```

### Textarea

```tsx
<textarea
  rows={3}
  className={cn(
    "w-full px-3 py-2 resize-none",
    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
    "text-sm",
    "placeholder:text-[var(--text-muted)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
  )}
/>
```

### Password Input with Toggle

```tsx
<div className="relative">
  <input
    type={showKey ? "text" : "password"}
    className={cn(
      "w-full px-3 py-2 pr-20",
      "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
      "text-sm font-mono",
      "placeholder:text-[var(--text-muted)]",
      "focus:outline-none focus:border-[var(--text-muted)]",
      "transition-colors"
    )}
  />
  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
    {/* Icon buttons */}
  </div>
</div>
```

---

## 7. Tags & Badges

### Mono Tag

```css
.mono-tag {
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
}
```

**Usage**: Version numbers, status indicators, counts

```tsx
<span className="mono-tag">v0.1</span>
<span className="mono-tag">From 3 images</span>
```

---

## 8. Cards & Panels

### Basic Card/Panel

```tsx
<div className="border border-[var(--border-color)]">
  {/* Content */}
</div>
```

### Card with Header

```tsx
<div className="border border-[var(--border-color)]">
  <div className="border-b border-[var(--border-color)] p-4">
    {/* Header */}
  </div>
  <div className="p-4">
    {/* Content */}
  </div>
</div>
```

### Tip/Info Box

```tsx
<div className="p-3 bg-[var(--bg-secondary)] border-l-2 border-[var(--accent-ai)] text-sm">
  <span className="text-[var(--text-muted)]">💡 </span>
  <span className="text-[var(--text-secondary)]">Tip text here</span>
</div>
```

---

## 9. Tabs

### Tab Container

```tsx
<div className="border border-[var(--border-color)]">
  <div className="flex border-b border-[var(--border-color)]" role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab}
        role="tab"
        aria-selected={selected === tab}
        className={cn(
          "flex-1 px-3 py-2.5 text-sm font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-ai)]",
          selected === tab
            ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-ai)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50"
        )}
      >
        {tab}
      </button>
    ))}
  </div>
  <div role="tabpanel" className="p-4">
    {/* Tab content */}
  </div>
</div>
```

---

## 10. Drop Zone / Upload Area

```tsx
<div
  className={cn(
    "border-2 border-dashed p-8 cursor-pointer transition-colors",
    "flex flex-col items-center justify-center gap-4 min-h-[200px]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
    isDragging
      ? "border-[var(--accent-ai)] bg-[var(--accent-ai)]/5"
      : "border-[var(--border-color)] hover:border-[var(--text-muted)]"
  )}
>
  <Upload className={cn(
    "w-8 h-8",
    isDragging ? "text-[var(--accent-ai)]" : "text-[var(--text-muted)]"
  )} />
  <div className="text-center">
    <p className="text-[var(--text-primary)]">Drop images or click to upload</p>
    <p className="text-sm text-[var(--text-muted)] mt-1">
      JPG, PNG, WebP · Max 5MB · Up to 5 images
    </p>
  </div>
</div>
```

---

## 11. Alert / Error Messages

```tsx
<div 
  role="alert"
  className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm"
>
  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
  <p>Error message text</p>
</div>
```

---

## 12. Loading States

### Spinner with Icon

```tsx
<div className="relative">
  <Loader2 className="w-12 h-12 text-[var(--accent-ai)] animate-spin" />
  <Sparkles className="w-4 h-4 text-[var(--accent-gold)] absolute -top-1 -right-1" />
</div>
```

### Loading Button State

```tsx
<button disabled className="...">
  <Loader2 className="w-4 h-4 animate-spin" />
  Processing...
</button>
```

### Loading Placeholder

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ai)] mb-4" />
  <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
  <p className="text-xs text-[var(--text-muted)] mt-1">This may take a moment</p>
</div>
```

---

## 13. Links

### Inline Link

```tsx
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  className="underline underline-offset-2 hover:text-[var(--text-secondary)]"
>
  Link text
  <ExternalLink className="w-3 h-3 inline ml-1" />
</a>
```

### Subtle Link (Footer style)

```tsx
<a
  href="#"
  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] underline underline-offset-2"
>
  Link text
</a>
```

---

## 14. Layout Patterns

### Page Container

```tsx
<main className="min-h-screen bg-[var(--bg-primary)]">
  {/* Content */}
</main>
```

### Content Container

```tsx
<div className="max-w-3xl mx-auto px-6">
  {/* Centered content */}
</div>
```

### Header

```tsx
<header className="border-b border-[var(--border-color)]">
  <div className="max-w-3xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-medium">App Name</h1>
      <span className="mono-tag">v0.1</span>
    </div>
  </div>
</header>
```

### Footer

```tsx
<footer className="border-t border-[var(--border-color)] mt-auto">
  <div className="max-w-3xl mx-auto px-6 py-6">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
      {/* Footer content */}
    </div>
  </div>
</footer>
```

### Section with Border

```tsx
<section className="border-b border-[var(--border-color)]">
  <div className="max-w-3xl mx-auto px-6 py-12">
    {/* Section content */}
  </div>
</section>
```

---

## 15. Focus & Accessibility

### Standard Focus Ring

```tsx
"focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
```

### Inset Focus Ring (for tabs)

```tsx
"focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-ai)]"
```

### Screen Reader Only

```tsx
<span className="sr-only">Hidden text for screen readers</span>
```

---

## 16. Image Display

### Thumbnail Grid

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
  {images.map((img) => (
    <div key={img.id} className="relative group aspect-square">
      <img
        src={img.src}
        alt={img.alt}
        className="w-full h-full object-cover border border-[var(--border-color)]"
      />
      <button className={cn(
        "absolute top-1 right-1 p-1",
        "bg-black/60 text-white opacity-0 group-hover:opacity-100 focus:opacity-100",
        "transition-opacity"
      )}>
        <X className="w-4 h-4" />
      </button>
    </div>
  ))}
</div>
```

### Generated Image Display

```tsx
<img
  src={imageUrl}
  alt="Description"
  className="max-w-full max-h-[500px] object-contain border border-[var(--border-color)]"
/>
```

---

## 17. Required Dependencies

### NPM Packages

```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "lucide-react": "^0.562.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

### Utility Function (lib/utils.ts)

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 18. Complete globals.css

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-mono);
  --font-mono: var(--font-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;
  --radius-2xl: 0;
  --radius-3xl: 0;
  --radius-4xl: 0;
}

:root {
  --radius: 0;

  /* Technical Architect Color Palette */
  --bg-primary: #faf9f7;
  --bg-secondary: #f5f4f2;
  --grid-lines: #d8d6d3;
  --border-color: #d4d2cf;
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --text-muted: #888888;
  --accent-gold: #f5a623;
  --accent-ai: #6366f1;

  /* Spacing System (24px base) */
  --space-xs: 6px;
  --space-sm: 12px;
  --space-md: 24px;
  --space-lg: 48px;
  --space-xl: 72px;
  --space-2xl: 120px;
  --container-max: 1152px;

  /* Tailwind variable mappings */
  --background: var(--bg-primary);
  --foreground: var(--text-primary);
  --card: var(--bg-secondary);
  --card-foreground: var(--text-primary);
  --popover: var(--bg-secondary);
  --popover-foreground: var(--text-primary);
  --primary: var(--text-primary);
  --primary-foreground: var(--bg-primary);
  --secondary: var(--bg-secondary);
  --secondary-foreground: var(--text-primary);
  --muted: var(--bg-secondary);
  --muted-foreground: var(--text-muted);
  --accent: var(--bg-secondary);
  --accent-foreground: var(--text-primary);
  --destructive: #dc2626;
  --border: var(--border-color);
  --input: var(--border-color);
  --ring: var(--text-muted);
  --chart-1: var(--accent-gold);
  --chart-2: var(--accent-ai);
  --chart-3: var(--text-secondary);
  --chart-4: var(--text-muted);
  --chart-5: var(--border-color);
  --sidebar: var(--bg-primary);
  --sidebar-foreground: var(--text-primary);
  --sidebar-primary: var(--text-primary);
  --sidebar-primary-foreground: var(--bg-primary);
  --sidebar-accent: var(--bg-secondary);
  --sidebar-accent-foreground: var(--text-primary);
  --sidebar-border: var(--border-color);
  --sidebar-ring: var(--text-muted);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

html, body, * {
  font-family: var(--font-mono), ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}

.mono-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.mono-tag {
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
}

.accent-gold { color: var(--accent-gold); }
.accent-ai { color: var(--accent-ai); }
```

---

## 19. Icon Library

**Recommended**: Lucide React

Common icons used in this design system:
- `Upload`, `X`, `ImageIcon`, `AlertCircle`, `Loader2` - Upload/forms
- `Eye`, `EyeOff`, `Key`, `ExternalLink` - Inputs/links
- `Copy`, `Check`, `Sparkles`, `Download`, `RefreshCw`, `RotateCcw` - Actions

```tsx
import { Upload, X, Loader2, Sparkles } from "lucide-react";

// Standard icon sizes
// Small: w-3 h-3 (inline, labels)
// Default: w-4 h-4 (buttons, lists)
// Medium: w-5 h-5 (section headers)
// Large: w-6 h-6 to w-8 h-8 (empty states, upload zones)
// XL: w-12 h-12 (loading spinners, hero)
```

---

## 20. Design Principles Summary

1. **Monospace First**: All text uses Geist Mono for a technical, tool-like aesthetic
2. **Sharp Corners**: Zero border radius throughout - creates a blueprint/technical drawing feel
3. **Warm Neutrals**: Off-white backgrounds (#faf9f7) instead of pure white for reduced eye strain
4. **Restrained Color**: Two accent colors only (gold for decoration, indigo for interaction)
5. **Clear Hierarchy**: Three text colors (primary, secondary, muted) create visual hierarchy
6. **Border-Defined Sections**: Borders rather than shadows to separate content areas
7. **Consistent Focus States**: Indigo ring with offset for keyboard navigation
8. **Accessible by Default**: ARIA attributes, focus indicators, proper contrast ratios

---

## Implementation Checklist

- [ ] Install dependencies: `bun add clsx tailwind-merge lucide-react`
- [ ] Install dev dependencies: `bun add -D tailwindcss @tailwindcss/postcss`
- [ ] Configure Geist Mono font in layout.tsx
- [ ] Copy globals.css with all CSS custom properties
- [ ] Create lib/utils.ts with cn() function
- [ ] Apply body class: `${geistMono.variable} antialiased`
- [ ] Test all component patterns
- [ ] Verify focus states are visible
- [ ] Check color contrast with accessibility tools

---

*Last Updated*: 2026-01-13
*Source Project*: imgPrompter11
*Design System*: Technical Architect v1.0
