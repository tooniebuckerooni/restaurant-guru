# Free & Fast Schedule Maker — Design System

**Product:** Free & Fast Schedule Maker — a workforce scheduling web app for shift-based small businesses (restaurants, bars, cafés, retail). Flagship feature is one-tap schedule generation.

This design system was authored from scratch for this project — no existing brand assets, codebase, or Figma file were provided as source material. All tokens, components, and UI kits below are original work built to the brief.

## Two audiences, two surfaces
- **Manager (laptop/tablet)** — a dense drag-and-drop weekly schedule grid that stays readable with 30+ shift blocks, each showing name, role, and time range. See `ui_kits/manager-schedule-grid/`.
- **Staff (phone)** — light, friendly, glanceable "My Shifts": check upcoming shifts, request time off, swap shifts. See `ui_kits/staff-mobile/`.

## Mood
Warm and confident with hospitality soul — a well-run bar at golden hour, not a corporate HR tool. Trustworthy enough for a business owner, human enough that a 19-year-old barback doesn't dread opening it. Light mode first; the palette is built to translate cleanly to a dark mode later (warm neutral scale + status/role hues chosen for contrast at both ends).

## Index
- `styles.css` — root stylesheet, imports everything below.
- `tokens/` — `colors.css` (brand, neutrals, status, 8 role colors, semantic aliases), `typography.css` (display/body fonts, sizes, tabular-numeral feature), `spacing.css` (4px scale, radii), `effects.css` (warm shadows, easing), `fonts.css` (Google Fonts import).
- `guidelines/` — foundation specimen cards: color-brand, color-neutrals, color-status, color-roles, type-display, type-body, type-tabular, spacing-scale, spacing-radii.
- `components/` — `buttons/Button`, `shift-block/ShiftBlock`, `badge/Badge`, `forms/Input`+`Select`, `modal/Modal`, `toast/Toast`, `stat-tile/StatTile`, `bar-meter/BarMeter`. Each has `.jsx`, `.d.ts`, `.prompt.md`, and a `.card.html` demo.
- `ui_kits/manager-schedule-grid/index.html` — full weekly schedule grid screen (desktop).
- `ui_kits/staff-mobile/index.html` — full "My Shifts" mobile screen.
- `SKILL.md` — portable skill file for Claude Code / other agents.

## Content fundamentals
- **Voice:** direct, warm, a little informal — like a manager who respects your time, not corporate HR copy. "Publish", "Generate schedule", "Swap a shift" — verbs, not nouns.
- **Person:** second person for staff-facing copy ("Hey Ava", "Your next shift"); first-plural/neutral for manager tooling ("Total hours", "Labor cost").
- **Casing:** sentence case everywhere (titles, buttons, labels) — never title case, never all-caps except tiny section eyebrows (e.g. "STAFF", "TOTAL HOURS" at 12px, wide tracking).
- **Numbers:** always exact and tabular — "$4,820", "312 hrs", "22.5 hrs" — never rounded away in the UI even though the tone is casual.
- **Emoji:** used sparingly, only in the friendliest staff-facing moments (a wave in "Hey Ava 👋" on mobile home) — never in the manager grid, badges, or buttons.
- **Errors/conflicts:** matter-of-fact, not alarmist. "Double-booked" not "Uh oh! Conflict detected!!".

## Visual foundations
- **Color:** one warm amber brand color (`--brand-500`, golden-hour), a warm-tinted neutral scale (not cool gray — hue ~70 keeps the grid feeling hospitality-warm even at high density), 4 status hues (success green / warning amber / error red / draft gray) and 8 role hues chosen on hue angles (165–350°) that stay clear of the status hues so a shift block's role tint is never mistaken for a status flag.
- **Type:** Bricolage Grotesque (display, warm rounded terminals) for headings and marketing moments; Public Sans (body/UI) for everything dense — it has genuine tabular-figure support (`tnum`), so hours/times/money stay column-aligned in the schedule grid and stat tiles.
- **Spacing:** 4px base grid (4→64), radii from 6px (small controls) to 20px (modals), full/pill for badges and the mobile week-summary card.
- **Elevation:** shadows are warm-tinted (brown-black, not neutral gray) at 3 levels (sm/md/lg) plus a dedicated focus-ring shadow using the brand color.
- **Backgrounds:** flat warm-neutral surfaces, no gradients, no photography/illustration — the brand color itself (used as a solid fill on the mobile week-summary card) carries the "golden hour" warmth instead.
- **Motion:** short, standard-eased transitions (120–200ms) on hover/press/focus only — no bouncy or decorative animation; this is a tool people open dozens of times a day.
- **Hover/press:** hover darkens fills one step (primary/danger) or tints neutral surfaces (secondary/ghost); press scales buttons to 0.97. No color inversion.
- **Cards/borders:** 1px solid `--border-default`, no left-border-only accent cards — role/status color instead shows as a 4px left border directly on shift blocks (functional, not decorative) plus a full tint background.
- **Corner radii:** sm 6 / md 10 / lg 14 / xl 20 / full — controls tighter, cards and modals rounder, mobile summary card and badges fully pill.

## Iconography
Icons are **Lucide** (stroke icons, 2px weight, CDN-loaded — `https://unpkg.com/lucide@latest`), wired through a shared `components/icon/Icon.jsx` wrapper. No emoji-as-icon, no hand-drawn SVG. Used for: modal/toast dismiss (`x`), generate-schedule CTA (`zap`), swap shift (`repeat-2`), time-off (`calendar-off`), and mobile bottom-nav (`calendar-days` / `inbox` / `users` / `user-round`). No logo exists; the wordmark "Free & Fast" in the display typeface stands in for a mark everywhere one would appear.

## Dark mode
Implemented as a second token scope: add `data-theme="dark"` to any ancestor (e.g. `<html data-theme="dark">`) and the neutral ramp inverts, brand lightens slightly for contrast on dark surfaces, status/role tints become dark-appropriate low-light fills, and shadows switch to true black at higher opacity. See the "Dark Mode" specimen card. Role/status/brand *solid* colors (500-level) are shared between themes — only tints, surfaces, text, and borders change — so a shift block looks like "the same bartender" in both modes.

## Open items / asks
1. **No logo or existing brand assets were provided** — the wordmark is set in type only. Please share a mark if one exists.
2. Drag-and-drop interaction on the manager grid is visually implied (shift blocks look draggable) but not wired up in this static kit — let us know if you want a working drag prototype next.
