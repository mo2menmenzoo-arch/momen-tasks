# Design System

<!-- impeccable:design-schema 1 -->

## Visual World

**Techo × Geometric Calm.** The design draws from two worlds the audience knows by heart: the Japanese Techo planner ritual (the gold standard of intentional physical planning — clean grids, subtle color zones, the tactile satisfaction of pen meeting paper) and Islamic geometric precision (mathematical order creating visual calm through tessellation and symmetry). The result is a digital surface that feels like opening a beautifully made planner — structured, breathable, intentional — with the geometric clarity that comes from the product's Arabic naming origin.

## Color Strategy

**Committed.** A deep, warm dark foundation carries the surface. Six Life Zone accent colors provide the palette's range — each saturated enough to own its zone at 30-60% of zone surfaces, restrained enough to never overwhelm. The dark mode is not a gimmick; it is the primary scene: a person planning their evening, screen glowing softly, the world quiet.

### Primitive Tokens — Neutrals

```
--momen-black:        #0A0A0F
--momen-gray-950:     #111118
--momen-gray-900:     #1A1A24
--momen-gray-800:     #252530
--momen-gray-700:     #35354A
--momen-gray-600:     #4A4A65
--momen-gray-500:     #6B6B8A
--momen-gray-400:     #8E8EAA
--momen-gray-300:     #B0B0C8
--momen-gray-200:     #D0D0E0
--momen-gray-100:     #E8E8F0
--momen-white:        #F5F5FA

--momen-cream:        #FAF8F5
--momen-warm-white:   #F2EDE8
```

### Semantic Tokens — Zone Palette

Six Life Zones, each with a distinct color identity:

```
--zone-work:          #5B8DEF    (blue — focus, productivity)
--zone-health:        #4ECDC4    (teal — vitality, balance)
--zone-relationships: #E87C9F    (rose — warmth, connection)
--zone-growth:        #A78BFA    (violet — learning, aspiration)
--zone-home:          #F0A868    (amber — shelter, comfort)
--zone-finance:       #6BCB77    (green — growth, stability)
```

### Semantic Tokens — Priority

```
--priority-critical:  #EF4444
--priority-high:      #F59E0B
--priority-medium:    #5B8DEF
--priority-low:       #6B6B8A
```

### Semantic Tokens — Functional

```
--surface-primary:    var(--momen-gray-950)
--surface-secondary:  var(--momen-gray-900)
--surface-elevated:   var(--momen-gray-800)
--surface-overlay:    rgba(10, 10, 15, 0.85)

--text-primary:       var(--momen-gray-100)
--text-secondary:     var(--momen-gray-400)
--text-tertiary:      var(--momen-gray-600)
--text-inverse:       var(--momen-gray-950)

--border-subtle:      var(--momen-gray-800)
--border-default:     var(--momen-gray-700)
--border-strong:      var(--momen-gray-600)

--accent-primary:     var(--zone-work)
--accent-success:     var(--zone-finance)
--accent-warning:     var(--priority-high)
--accent-danger:      var(--priority-critical)
--accent-info:        var(--zone-growth)
```

### Light Mode Overrides

```
--surface-primary:    var(--momen-cream)
--surface-secondary:  var(--momen-warm-white)
--surface-elevated:   var(--momen-white)
--surface-overlay:    rgba(250, 248, 245, 0.9)
--text-primary:       var(--momen-gray-950)
--text-secondary:     var(--momen-gray-600)
--text-tertiary:      var(--momen-gray-500)
--text-inverse:       var(--momen-white)
--border-subtle:      var(--momen-gray-200)
--border-default:     var(--momen-gray-300)
--border-strong:      var(--momen-gray-400)

--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.06)
--shadow-md:   0 4px 12px rgba(0, 0, 0, 0.08)
--shadow-lg:   0 8px 24px rgba(0, 0, 0, 0.1)
--shadow-xl:   0 16px 48px rgba(0, 0, 0, 0.12)
--shadow-glow: 0 0 20px rgba(91, 141, 239, 0.1)
```

## Typography

**DM Sans** for body and UI — geometric, warm, highly legible at small sizes, excellent for mobile screens. **Space Grotesk** for display headings — distinctive personality without being precious, geometric precision that echoes the Islamic pattern influence. **JetBrains Mono** for code and monospaced content.

Fonts loaded via Google Fonts.

### Type Scale

```
--font-family-body:     'DM Sans', system-ui, -apple-system, sans-serif
--font-family-display:  'Space Grotesk', system-ui, -apple-system, sans-serif
--font-family-mono:     'JetBrains Mono', 'SF Mono', 'Fira Code', monospace

--text-xs:    0.75rem   (12px)
--text-sm:    0.875rem  (14px)
--text-base:  1rem      (16px)
--text-lg:    1.125rem  (18px)
--text-xl:    1.25rem   (20px)
--text-2xl:   1.5rem    (24px)
--text-3xl:   1.875rem  (30px)
--text-4xl:   2.25rem   (36px)
```

### Line Heights

```
--leading-tight:   1.25
--leading-snug:    1.375
--leading-normal:  1.5
--leading-relaxed: 1.625
```

### Font Weights

```
--weight-regular:   400
--weight-medium:    500
--weight-semibold:  600
--weight-bold:      700
```

### Heading Classes

Display headings use Space Grotesk, body text uses DM Sans:

| Class | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `.heading-4xl` | Display | 36px | Bold | tight | -0.02em |
| `.heading-3xl` | Display | 30px | Bold | tight | -0.01em |
| `.heading-2xl` | Display | 24px | Semibold | snug | — |
| `.heading-xl` | Display | 20px | Semibold | snug | — |
| `.heading-lg` | Display | 18px | Medium | snug | — |
| `.body-lg` | Body | 18px | Regular | normal | — |
| `.body-md` | Body | 16px | Regular | normal | — |
| `.body-sm` | Body | 14px | Regular | normal | — |
| `.body-xs` | Body | 12px | Regular | normal | — |

### Typography Utilities

- **Text colors:** `.text-primary`, `.text-secondary`, `.text-tertiary`, `.text-inverse`
- **Zone colors:** `.text-zone-work`, `.text-zone-health`, `.text-zone-relationships`, `.text-zone-growth`, `.text-zone-home`, `.text-zone-finance`
- **Font weights:** `.font-regular`, `.font-medium`, `.font-semibold`, `.font-bold`
- **Font families:** `.font-body`, `.font-display`, `.font-mono`
- **Alignment:** `.text-left`, `.text-center`, `.text-right`
- **Truncation:** `.truncate` (single line), `.line-clamp-2`, `.line-clamp-3`
- **Tabular numbers:** `.tabular-nums` (for timers, counters)

## Spacing

8px base unit. Consistent rhythm throughout.

```
--space-0:   0
--space-1:   0.25rem    (4px)
--space-2:   0.5rem     (8px)
--space-3:   0.75rem    (12px)
--space-4:   1rem       (16px)
--space-5:   1.25rem    (20px)
--space-6:   1.5rem     (24px)
--space-8:   2rem       (32px)
--space-10:  2.5rem     (40px)
--space-12:  3rem       (48px)
--space-16:  4rem       (64px)
--space-20:  5rem       (80px)
```

## Border Radius

Soft, approachable — never sharp, never bubbly.

```
--radius-sm:   6px
--radius-md:   10px
--radius-lg:   14px
--radius-xl:   20px
--radius-2xl:  28px
--radius-full: 9999px
```

## Shadows

Subtle elevation in dark mode. Layered for depth. Light mode reduces opacity significantly.

```
--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.3)
--shadow-md:   0 4px 12px rgba(0, 0, 0, 0.25)
--shadow-lg:   0 8px 24px rgba(0, 0, 0, 0.3)
--shadow-xl:   0 16px 48px rgba(0, 0, 0, 0.35)
--shadow-glow: 0 0 20px rgba(91, 141, 239, 0.15)
```

## Z-Index Scale

Layering order from base to highest:

```
--z-base:      0
--z-elevated:  10
--z-sticky:    100
--z-overlay:   200
--z-modal:     300
--z-toast:     400
--z-focus:     500
```

## Layout Constants

Fixed dimensions for persistent UI elements:

```
--tab-bar-height:     64px
--header-height:      56px
--capture-bar-height: 60px
--safe-area-bottom:   env(safe-area-inset-bottom, 0px)
--safe-area-top:      env(safe-area-inset-top, 0px)
```

Safe area utilities: `.safe-area-top`, `.safe-area-bottom`

## Motion

Calm, purposeful, never jarring. 300ms is the signature duration.

### Duration Tokens

```
--duration-instant:  100ms
--duration-fast:     200ms
--duration-normal:   300ms
--duration-slow:     500ms
```

### Easing Tokens

```
--ease-default:      cubic-bezier(0.4, 0, 0.2, 1)
--ease-in:           cubic-bezier(0.4, 0, 1, 1)
--ease-out:          cubic-bezier(0, 0, 0.2, 1)
--ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Motion Principles

- Task completion: 300ms checkmark animation + haptic vibration (Vibration API)
- Drag preview: ghost snap to 15-minute increments
- Pull-to-refresh: rotating clarity quote (user-disableable)
- Long-press: radial quick-action menu (Complete / Snooze / Reschedule / Delete)
- `prefers-reduced-motion`: all non-essential animations disabled (transitions collapse to 0.01ms)

### Transition Utilities

| Class | Properties | Duration |
|---|---|---|
| `.transition-colors` | color, background-color, border-color | normal |
| `.transition-transform` | transform | normal |
| `.transition-all` | all | normal |
| `.transition-spring` | transform | normal + spring easing |

### Animation Utilities

| Class | Animation | Duration | Easing |
|---|---|---|---|
| `.animate-fade-in` | opacity 0→1 | normal | ease-out |
| `.animate-fade-in-up` | opacity + translateY(8px) | normal | ease-out |
| `.animate-fade-in-down` | opacity + translateY(-8px) | normal | ease-out |
| `.animate-slide-up` | translateY(100%) | normal | ease-out |
| `.animate-slide-down` | translateY(0→100%) | normal | ease-in |
| `.animate-slide-in-right` | translateX(100%) | normal | ease-out |
| `.animate-scale-in` | scale(0.95) + opacity | fast | ease-out |
| `.animate-pop-in` | scale(0.8→1.05→1) + opacity | normal | spring |
| `.animate-pulse` | opacity pulse | 2s infinite | default |
| `.animate-radial-expand` | scale(0)→scale(1) + rotate | normal | spring |

### Skeleton Loading

`.skeleton` — gradient shimmer animation (1.5s infinite), uses `--surface-elevated` and `--border-subtle`.

### Stagger Children

`.stagger-children > *` — children animate in sequentially with 50ms delay increments (up to 8 children).

## Component Language

### Buttons

Base `.btn` with pill shape (`--radius-full`), 200ms transitions, scale(0.97) on active.

| Variant | Class | Style |
|---|---|---|
| Primary | `.btn-primary` | Filled accent, white text, glow shadow on hover |
| Secondary | `.btn-secondary` | Transparent, bordered, elevated background on hover |
| Ghost | `.btn-ghost` | No border, text-only, subtle hover background |
| Danger | `.btn-danger` | Filled danger color, white text |
| Icon | `.btn-icon` | 40×40px circle, no padding |
| Icon Small | `.btn-icon-sm` | 32×32px circle, no padding |
| Small | `.btn-sm` | Compact padding, xs font |
| Large | `.btn-lg` | Generous padding, base font |

**FAB:** Fixed bottom-right, 56×56px, accent-colored, `--shadow-lg`, `--z-elevated`. Positioned above tab bar with safe area offset.

### Cards

Base `.card` — elevated surface, subtle border, `--radius-lg`.

| Variant | Class | Description |
|---|---|---|
| Interactive | `.card-interactive` | Border brightens + shadow on hover, scale(0.99) on active |
| Zone | `.card-zone` | 4px colored left accent bar via `--card-zone-color` custom property |
| Task | `.task-card` | Full task layout: checkbox + content + meta + hover actions |

**Task card anatomy:**
- `.task-card-checkbox` — 22px circle, border, accent background when `.checked`
- `.task-card-content` — flex container for title and meta
- `.task-card-title` — sm font, medium weight
- `.task-card-meta` — xs font, tertiary color, flex row
- `.task-card-priority` — 8px colored dot
- `.task-card-actions` — hidden until hover (opacity transition)

### Inputs

Base `.input` — clean borders, `--radius-md`, 200ms transitions.

| Variant | Class | Description |
|---|---|---|
| Error | `.input-error` | Danger border + glow ring |
| Search | `.input-search` | Left-padded for search icon (inline SVG) |
| Textarea | `.textarea` | Min-height 100px, vertical resize |

Includes `.input-group`, `.input-label`, `.input-hint` (error state turns hint red).

### Chips / Pills

Base `.chip` — inline-flex, `--radius-full`, xs font.

| Variant | Class | Description |
|---|---|---|
| Active | `.chip-active` | Filled accent, white text |
| Zone | `.chip-zone` | Uses `color-mix()` for tinted background/border from `--chip-zone-color` |

### Zone Cards

`.zone-card` — Uses `color-mix(in srgb, var(--zone-color) 10%, var(--surface-elevated))` for background. Border brightens to 30% zone color on hover.

- `.zone-card-icon` — 40×40px, 20% zone-color background
- `.zone-card-name` — Display font, sm, semibold
- `.zone-card-count` — xs, tertiary
- `.zone-card-progress` — Absolutely positioned top-right (SVG progress ring)

### Bottom Tab Bar

`.tab-bar` — Fixed bottom, 64px + safe area, secondary surface, flex around.

- `.tab-bar-item` — Column layout, tertiary color, accent when `.active`
- `.tab-bar-item-icon` — 24×24px
- `.tab-bar-item-label` — 10px, medium weight

5 tabs: Today / Calendar / Zones / Review / Profile.

### Quick Capture Bar

`.capture-bar` — Fixed above tab bar, 60px height, secondary surface.

- `.capture-bar-input` — Pill-shaped input, elevated background
- `.capture-bar-btn` — 36×36px icon buttons (left: add, right: mic)
- Expands to full modal on tap

### Progress Ring

`.progress-ring` — SVG-based, rotated -90deg. Track uses `--border-subtle`, fill uses animated `stroke-dashoffset`.

### Badge

`.badge` — Min 18px wide, danger-colored, pill-shaped, xs bold white text.

### Divider

`.divider` — 1px line, `--border-subtle`, 16px vertical margin.

### Toast / Snackbar

`.toast` — Fixed above tab bar, gray-800 background, `--radius-md`, `--shadow-lg`. Slides in with `fade-in-up`.

- `.toast-undo` — Accent-colored action button

### Modal / Bottom Sheet

- `.overlay` — Fullscreen backdrop with `--surface-overlay`, `--z-overlay`, fade-in
- `.bottom-sheet` — Max 480px wide, 85vh max height, slides up from bottom, `--radius-xl` top corners
- `.bottom-sheet-handle` — 36×4px pill drag indicator

### Segment Control

`.segment-control` — Pill-shaped container, elevated surface. Active segment gets accent fill with white text.

### Energy Mode Selector

`.energy-selector` — Row of 44×44px buttons. Active state: accent border, 10% accent background, glow shadow.

### Focus Session

`.focus-session` — Fullscreen overlay, `--z-focus`, centered column layout.

- `.focus-timer` — Display font, 72px, bold, tabular-nums
- `.focus-task-title` — xl, secondary, centered, max 300px

Features: ambient sound picker, subtask checklist, auto-prompt at session end.

### Weekly Review Cards

`.review-card` — Max 360px wide, elevated surface, `--radius-xl`, column layout.

- `.review-card-title` — Display font, lg, semibold
- `.radar-container` — 1:1 aspect ratio, max 240px, centered

### Scroll Container

`.scroll-horizontal` — Horizontal flex scroll with snap, hidden scrollbar, 12px gap.

### App Shell

```
.app-shell          → flex column, min-height 100dvh
  .app-header       → sticky top, 56px, safe area padding, z-sticky
  .app-content      → flex:1, padded, bottom offset for tab bar + capture bar
```

## Geometric Pattern System

A subtle geometric tessellation pattern (derived from Islamic star patterns) used as:

- Background texture at 3-5% opacity on elevated surfaces
- Divider ornament between sections (single row, muted)
- Loading state shimmer pattern
- Brand element on splash screen and empty states

### Pattern Classes

| Class | Description |
|---|---|
| `.momen-pattern` | Repeating Islamic star SVG at 4% opacity, 60px tile |
| `.momen-pattern-subtle` | Same pattern at 2% opacity via pseudo-element |
| `.momen-ornament` | Decorative divider: horizontal lines flanking a centered star symbol |
| `.momen-geo-accent` | Corner geometric accent (80×80px, top-right) for cards/headers |
| `.momen-loading` | Shimmer loading state with pattern overlay |
| `.momen-splash` | Fullscreen splash with large 120px pattern tile |

The pattern is SVG-based, generated procedurally, and respects `prefers-reduced-motion`.

## Empty States

Each designed with warmth and a clear next action:

| State | Copy | Action |
|---|---|---|
| No tasks | "Your day is a blank canvas. Add your first task." | Quick Capture pre-focused |
| All complete | "Nothing left. Enjoy the clarity." | Plan tomorrow / early review prompt |
| Empty zone | "This zone is quiet. Add a task or apply a Template." | Template gallery access |
| Offline first launch | "Connect once to get started." | Explicit, not broken |

Empty state structure: `.momen-empty-state` (centered column, generous padding) → icon (64px, tertiary) → title (display font, xl) → description (sm, secondary, max 280px).

## Dark/Light/Auto Theme

- Auto detects OS `prefers-color-scheme`
- Manual override via `data-theme="dark"` or `data-theme="light"` on `<html>`
- "Momen Calm" dark palette is the signature — designed for evening planning under low ambient light
- Light mode uses warm cream (`--momen-cream`) instead of pure white — less harsh, more planner-like
- Transition between themes: 300ms crossfade on background-color, color, border-color (applied to all elements)
- PWA standalone mode detection via `@media (display-mode: standalone)`

## Accessibility

- **Focus styles:** Custom `:focus-visible` — 2px solid accent with 2px offset, replaces default browser outline
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all animations and transitions (collapses to 0.01ms)
- **Safe areas:** `env(safe-area-inset-*)` for iOS notch, dynamic island, and home indicator
- **Semantic colors:** All functional tokens (surfaces, text, borders) swap automatically in light/dark mode
- **Touch targets:** Minimum 44×44px for interactive elements (energy buttons, tab items)
- **Scrollbar:** Custom thin scrollbar (6px) on pointer-fine devices, hidden on touch

## Base Reset

Applied in `index.css`:

- Universal box-sizing: border-box, margin/padding reset
- HTML: 16px root font, antialiased rendering, optimized legibility
- Body: DM Sans, base size, normal leading, theme-aware colors, 100dvh min-height
- Links: accent color, no underline (underline on hover)
- Images/SVGs: block, max-width 100%
- Buttons: inherit font/color, pointer cursor
- Lists: no bullet style
- Focus: outline removed, custom `:focus-visible` applied
