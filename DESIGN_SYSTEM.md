# Brush Atelier Design System

A visual system inspired by modern pottery and craft studios — warm, calm, minimal, and premium.

## Design Philosophy

**Overall vibe:** Creative, calming, and encouraging. Designed for artists and beginners, not engineers. Feels like a physical studio translated into software.

**Key principle:** If there is a tradeoff between "more features" and "more calm," choose calm.

---

## Color Palette

### Core Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#FAF8F5` | Page backgrounds, cards |
| `--foreground` | `#3D3832` | Primary text (warm charcoal) |

### Primary: Muted Terracotta

The main action color. Warm, inviting, and confident without being aggressive.

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#C4704F` | CTAs, primary buttons, links |
| `--primary-hover` | `#A85A3D` | Hover states for primary elements |
| `--primary-light` | `#D4917A` | Subtle highlights, badges |

### Accent: Sage Green

Secondary accent for balance and calm.

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#7D8B73` | Secondary actions, success states |
| `--accent-hover` | `#6A7862` | Hover states for accent elements |
| `--accent-light` | `#9BA894` | Light backgrounds, tags |

### Tertiary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--secondary` | `#B8A99A` | Clay beige - warm neutral accents |
| `--lavender` | `#9B8EA8` | Soft purple - sparingly for variety |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `--muted` | `#E8E4DF` | Borders, dividers, disabled states |
| `--muted-foreground` | `#6B635A` | Secondary text, captions |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#7D8B73` | Success messages (uses sage) |
| `--warning` | `#C4A04F` | Warnings (muted gold) |
| `--error` | `#B85C5C` | Errors (muted red) |

---

## Typography

### Font Family

**Primary:** Inter (Google Fonts)
- Weights: 400, 500, 600, 700

**Fallback:** system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Font Weights

| Element | Weight | Class |
|---------|--------|-------|
| Body text | 400-450 | `font-normal` |
| Labels | 500 | `font-medium` |
| Headings | 600-700 | `font-semibold`, `font-bold` |
| Hero headlines | 700-800 | `font-bold`, `font-extrabold` |

### Font Sizes

| Use Case | Mobile | Desktop |
|----------|--------|---------|
| Hero headline | `text-2xl` | `text-4xl` |
| Section heading | `text-lg` | `text-xl` |
| Body | `text-sm` | `text-base` |
| Caption | `text-xs` | `text-sm` |
| Label | `text-xs` | `text-sm` |

---

## Spacing

Generous whitespace is essential to the calm aesthetic.

### Standard Spacing Scale

| Size | Value | Usage |
|------|-------|-------|
| `xs` | 4px | Tight spacing within components |
| `sm` | 8px | Internal padding |
| `md` | 16px | Standard gaps |
| `lg` | 24px | Section padding |
| `xl` | 32px | Large section gaps |
| `2xl` | 48px | Major section separation |
| `3xl` | 64px | Page sections |

### Layout Guidelines

- **Cards:** `p-6` minimum, prefer `p-8`
- **Sections:** `py-12` or `py-16`
- **Content max-width:** `max-w-4xl` for reading, `max-w-6xl` for layouts
- **Gap between items:** `gap-4` minimum, prefer `gap-6`

---

## Border Radius

Soft, rounded corners everywhere.

| Element | Class |
|---------|-------|
| Buttons | `rounded-full` or `rounded-xl` |
| Cards | `rounded-2xl` |
| Inputs | `rounded-xl` |
| Images | `rounded-xl` or `rounded-2xl` |
| Badges | `rounded-full` |

---

## Shadows

Minimal shadows. Prefer borders or subtle background differences.

| Use Case | Class |
|----------|-------|
| Cards | `shadow-sm` or no shadow |
| Modals | `shadow-lg` |
| Buttons | `shadow-sm` on hover only |
| Dropdowns | `shadow-lg` |

---

## UI Components

### Buttons

**Primary (Terracotta)**
```
bg-[#C4704F] text-white hover:bg-[#A85A3D]
rounded-full px-6 py-3 font-semibold
```

**Secondary (Outline)**
```
border-2 border-[#C4704F] text-[#C4704F] hover:bg-[#C4704F]/10
rounded-full px-6 py-3 font-semibold
```

**Ghost**
```
text-[#3D3832] hover:bg-[#E8E4DF]
rounded-xl px-4 py-2 font-medium
```

### Cards

```
bg-white rounded-2xl p-6
border border-[#E8E4DF]
```

No shadow by default. Add `shadow-sm` sparingly.

### Inputs

```
bg-white border border-[#E8E4DF] rounded-xl
px-4 py-3 text-[#3D3832]
focus:border-[#C4704F] focus:ring-1 focus:ring-[#C4704F]/20
placeholder:text-[#6B635A]
```

---

## Icons

- Style: Minimal line icons or hand-drawn feel
- Weight: 1.5-2px stroke
- Avoid heavy, filled icons
- Recommended: Lucide Icons, Heroicons (outline variant)

---

## Motion

Subtle, calm transitions.

| Property | Duration | Easing |
|----------|----------|--------|
| Color changes | 150ms | ease |
| Scale/transform | 200ms | ease-out |
| Opacity | 200ms | ease |

Avoid bouncy or attention-grabbing animations.

---

## Do's and Don'ts

### Do
- Use generous whitespace
- Keep layouts centered and simple
- Use muted, earthy colors
- Prefer borders over shadows
- Make touch targets large (44px minimum)

### Don't
- Use bright, saturated colors
- Crowd the interface with features
- Use pure black (`#000`) for text
- Add unnecessary decorative elements
- Use aggressive animations

---

## Color Migration Guide

If updating existing components from the old blue palette:

| Old Color | New Color | Token |
|-----------|-----------|-------|
| `#2563EB` (blue) | `#C4704F` (terracotta) | `--primary` |
| `#1D4ED8` (dark blue) | `#A85A3D` (dark terracotta) | `--primary-hover` |
| `#C2410C` (orange) | Keep for logo "Brush" only | `--brand-orange` |
| `#1F2933` (charcoal) | `#3D3832` (warm charcoal) | `--foreground` |
| `#FBF7F2` (cream) | `#FAF8F5` (warmer cream) | `--background` |

---

## File Structure

```
app/
  globals.css          # Design tokens, CSS variables
  layout.tsx           # Font loading

components/
  ui/                  # Reusable UI components
    button.tsx
    card.tsx
    input.tsx
    ...

DESIGN_SYSTEM.md       # This file
```
