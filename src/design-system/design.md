# Pulse Design System

> Single source of truth for all visual decisions. If it isn't in here, it isn't in the product.

---

## Principles

1. **Invisible complexity** — the user sees a question and an answer box. Nothing else fights for attention.
2. **Tokens over values** — never write a raw hex, px, or rgba directly in a component. Reference a token.
3. **One component, one class** — don't compose glass + card + padding inline in every component. Use `.card`, `.btn`, etc.
4. **Contrast is non-negotiable** — every text colour must meet WCAG AA (4.5:1 on its background). Check before shipping.
5. **Touch first** — minimum tap target is 44×44px (`--touch-target`). No exceptions, even if the visible element is smaller.

---

## Files

| File | Purpose |
|------|---------|
| `tokens.css` | All CSS custom properties — import first |
| `components.css` | Reusable classes built on tokens — import second |
| `globals.css` | App-level resets and Tailwind integration — imports both above |

Import order in `globals.css`:
```css
@import "../design-system/tokens.css";
@import "../design-system/components.css";
@import "tailwindcss";
```

---

## Colour

### Background
| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#09090f` | Page background |
| `--color-surface` | `rgba(255,255,255,0.04)` | Glass card fill |
| `--color-surface-hover` | `rgba(255,255,255,0.07)` | Hover state surface |
| `--color-surface-raised` | `rgba(255,255,255,0.08)` | Elevated surface |

### Border
| Token | Value | Use |
|-------|-------|-----|
| `--color-border` | `rgba(255,255,255,0.08)` | All borders |
| `--color-border-focus` | `#6366f1` | Focus ring colour |

### Accent
| Token | Value | Use |
|-------|-------|-----|
| `--color-accent` | `#6366f1` | Primary CTA, active states, topic labels |
| `--color-accent-hover` | `#4f52d4` | Hover on accent bg |
| `--color-accent-glow` | `rgba(99,102,241,0.3)` | Glow effects, selection highlight |
| `--color-accent-tint` | `rgba(99,102,241,0.15)` | Soft tinted backgrounds |

### Text
| Token | Value | Contrast on bg | Use |
|-------|-------|----------------|-----|
| `--color-text` | `#f0f0f5` | ~18:1 | Body copy, headings |
| `--color-text-muted` | `rgba(240,240,245,0.6)` | ~6.8:1 | Secondary labels, placeholders |
| `--color-text-on-accent` | `#ffffff` | sufficient | Text on accent/brand buttons |

> **Rule:** Never go below 0.6 opacity on `--color-text` on the default background. 0.45 fails WCAG AA.

### Status
| Token | Colour | Status |
|-------|--------|--------|
| `--color-status-new` | indigo 0.85 | Unanswered question |
| `--color-status-draft` | amber 0.9 | Answer started |
| `--color-status-done` | emerald 0.9 | Post generated, not posted |
| `--color-status-published` | emerald 1.0 | Posted to LinkedIn |
| `--color-status-skipped` | white 0.4 | Question skipped |

### Brand / Semantic
| Token | Value | Use |
|-------|-------|-----|
| `--color-linkedin` | `#0a66c2` | LinkedIn connect button |
| `--color-error` | `rgba(248,113,113,0.9)` | Error messages only |

---

## Spacing

4 px base grid. All layout values must be multiples of 4.

| Token | Value | Tailwind equiv | Use |
|-------|-------|----------------|-----|
| `--space-1` | 4px | p-1 | Icon gap, tight stack |
| `--space-2` | 8px | p-2 | Badge padding, small gap |
| `--space-3` | 12px | p-3 | Button padding-y |
| `--space-4` | 16px | p-4 | Page horizontal inset |
| `--space-5` | 20px | p-5 | Card padding-y, nav padding-y |
| `--space-6` | 24px | p-6 | Card padding-x, nav padding-x |
| `--space-7` | 28px | p-7 | — |
| `--space-8` | 32px | p-8 | Section gap |
| `--space-10` | 40px | p-10 | — |
| `--space-11` | 44px | — | Touch target minimum |
| `--space-12` | 48px | p-12 | — |
| `--space-16` | 64px | p-16 | Page bottom padding |

### Component shortcuts
| Token | Value | Use |
|-------|-------|-----|
| `--card-padding-x` | 24px | All card horizontal padding |
| `--card-padding-y` | 20px | All card vertical padding |
| `--btn-padding-x` | 16px | Button horizontal padding |
| `--btn-padding-y` | 12px | Button vertical padding (gives ≥44px height) |
| `--nav-padding-x` | 24px | Header/nav horizontal padding |
| `--nav-padding-y` | 20px | Header/nav vertical padding |

---

## Typography

Font stack: `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif`

### Scale
| Token | Size | Use |
|-------|------|-----|
| `--font-size-xs` | 12px | Minimum. Labels, badges, nav links, secondary copy |
| `--font-size-sm` | 14px | Body text in cards, textarea content |
| `--font-size-base` | 16px | Standard body |
| `--font-size-lg` | 18px | Question text |
| `--font-size-xl` | 20px | — (reserved) |

> **Rule:** Never use font sizes below 12px (`--font-size-xs`) in visible UI. The old `text-[10px]` and `text-[11px]` classes are banned.

### Weights
| Token | Value | Use |
|-------|-------|-----|
| `--font-weight-regular` | 400 | Body |
| `--font-weight-medium` | 500 | Labels, nav, section headings |
| `--font-weight-semibold` | 600 | Buttons, important labels, brand name |

### Tracking
| Token | Value | Use |
|-------|-------|-----|
| `--tracking-normal` | 0 | Body text |
| `--tracking-wide` | 0.05em | — |
| `--tracking-widest` | 0.1em | Uppercase section labels only |

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 8px | Small buttons, tags, badges |
| `--radius-md` | 12px | Inputs, secondary buttons |
| `--radius-lg` | 16px | Standard cards |
| `--radius-xl` | 20px | Feature cards, textarea |
| `--radius-full` | 9999px | Pills, dots, avatar circles, icon buttons |

---

## Glass Effect

The signature visual of Pulse. Apply via `.glass` class or `.card`.

```css
background:              var(--color-surface);
border:                  1px solid var(--color-border);
backdrop-filter:         blur(20px);
-webkit-backdrop-filter: blur(20px);
```

**Rules:**
- Only apply to elements that sit in front of the 3D background
- Never nest glass inside glass — use `--color-surface-raised` for a second layer
- Don't add extra `background-color` inline — it defeats the blur

---

## Focus States

All interactive elements must have a visible focus state for keyboard navigation.

**Standard ring:**
```css
outline: 2px solid var(--color-accent);
outline-offset: 2px;
```

**For textareas and inputs** (ring without outline jump):
```css
box-shadow: 0 0 0 2px var(--color-accent);
border-color: var(--color-accent);
```

**Rule:** Never use `outline: none` without replacing with `focus-visible` equivalent.

---

## Touch Targets

Minimum interactive area: **44×44px** (`--touch-target`).

The visible element can be smaller — pad the hit area with wrapper or use `min-height: var(--touch-target)` on the element itself.

Applied to:
- Nav arrows (`.btn-icon` — 44×44px)
- Pagination dots (wrapper button is 28px, acceptable because dots are used with adjacent arrows)
- All `.btn` — `min-height: var(--touch-target)`

---

## Layout

### Page shell
Every page follows the same three-layer structure:
```
<main>                   ← min-h-dvh, flex col, position context for 3D bg
  <Background3D />       ← fixed, z-index -10
  <header.page-header>   ← Pulse wordmark + nav links
  <div.page-content>     ← flex-1, centred content column
    <div.content-column> ← max-width constraint
```

### Content widths
| Token | Value | Use |
|-------|-------|-----|
| `--max-width-content` | 560px | Standard page (home, history) |
| `--max-width-narrow` | 480px | Admin/settings |
| `--max-width-form` | 400px | Auth form |

---

## Components

### `.card`
Glass card with standard padding. Use for all content blocks.
```html
<div class="card">...</div>
```
Variants: `.card--raised` (slightly brighter surface for nesting).

### `.btn`
Base button. Always pair with a variant:
- `.btn-primary` — accent fill, white text
- `.btn-secondary` — glass fill, muted text
- `.btn-brand` — supply `background` inline (LinkedIn etc.)
- `.btn-ghost` — transparent, text only
- `.btn-icon` — square, 44×44, no text

```html
<button type="button" class="btn btn-primary">Generate post →</button>
<button type="button" class="btn btn-secondary">↺ Regenerate</button>
<button type="button" class="btn btn-icon" aria-label="Previous question">←</button>
```

**Rules:**
- Always set `type="button"` on non-submit buttons
- Disabled state handled by `.btn:disabled { opacity: 0.3 }` — don't override
- Never hardcode button heights — let `min-height: var(--touch-target)` do it

### `.input` / `.textarea`
Form fields with focus-visible ring.
```html
<label for="answer" class="sr-only">Your answer</label>
<textarea id="answer" class="textarea" rows="5"></textarea>
```

**Rule:** Every input/textarea must have an associated `<label>`. Placeholder text is not a label.

### `.label-section`
Small uppercase tracking label used as section headers inside cards.
```html
<p class="label-section">Topic areas</p>
```

### `.label-topic`
Accent-coloured version for the question topic chip above cards.
```html
<p class="label-topic">AI × Design</p>
```

### `.badge`
Status pill — supply colour via inline style.
```html
<span class="badge" style="background: ...; color: ...;">Posted</span>
```

### `.nav-link`
Navigation links in the header.
```html
<a href="/history" class="nav-link nav-link--active">History</a>
```

---

## Accessibility Rules

1. **Contrast ≥ 4.5:1** for all text on its computed background
2. **Focus visible** on every keyboard-reachable element — `focus-visible` pseudo-class, not `focus`
3. **Labels on every input** — `.sr-only` label is fine, placeholder alone is not
4. **Touch targets ≥ 44px** on all interactive elements
5. **`aria-expanded`** on accordion triggers, pointing to panel via `aria-controls`
6. **`aria-hidden="true"`** on decorative SVGs and icon characters (←, →, ↑, ↓)
7. **`role="alert"`** on dynamically injected error messages
8. **`type="button"`** on all `<button>` elements that don't submit a form
9. **`aria-label`** on icon-only buttons with no visible text

---

## What's banned

| Thing | Why | Instead |
|-------|-----|---------|
| Raw hex/rgba in components | Can't be changed globally | Use a token |
| `text-[10px]`, `text-[11px]` | Below readable minimum | `text-xs` (12px) min |
| `outline: none` without replacement | Keyboard inaccessible | Use `focus-visible` ring |
| `opacity: 0.5` stacked on `--color-text-muted` | Fails contrast | Use `--color-text-muted` directly |
| Nested glass inside glass | Looks muddy | Use `--color-surface-raised` |
| Inline padding that differs from card pattern | Inconsistency | Use `--card-padding-x/y` |
| `touch-target` below 44px on interactive elements | Mobile unusable | Use `--touch-target` |
