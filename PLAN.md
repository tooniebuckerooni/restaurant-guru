# Product & Build Plan — Working name: "Rota" (TBD)

A scheduling-first workforce app for small teams. Built by a hospitality operator, usable by any shift-based business — restaurants, bars, cafés, retail, salons, gyms, clinics, warehouses.

## Positioning

- **Core product is industry-agnostic.** Staff, roles, shifts, availability, labor rules — every shift business has these.
- **Hospitality is the launch wedge, not the ceiling.** Your domain expertise shows up as *templates and presets* (bar/FOH/BOH role packs, split shifts, service periods like brunch/dinner rush) rather than hard-coded restaurant logic. Other industries get their own template packs later.
- **The hook:** most competitors (7shifts, HotSchedules, Deputy, When I Work) make you build schedules by hand on a grid. Our flagship is generation — you set the rules once, then the week builds itself in seconds.

## Flagship: the Swift Schedule Generator

One tap turns your inputs into a complete, conflict-free weekly schedule.

**Inputs (set once, tweak rarely):**
1. **Staff** — roles they can work (a bartender who can also serve), max/min hours, wage, seniority.
2. **Availability** — recurring weekly availability + one-off time-off requests.
3. **Demand template** — for each day: which shifts exist, which roles, how many people. (e.g. "Friday: 2 bartenders 4pm–close, 4 servers 5–11, 1 host 5–10.") Optionally scaled by a busy-ness dial or, later, sales forecasts.
4. **Rules** — hard constraints (no double-booking, availability, max hours, required rest between close and open — no "clopens" unless allowed, minor labor rules) and soft preferences (fair distribution of weekend shifts, honor preferred shifts, keep people near their target hours, stay under labor budget).

**Engine:** constraint solver (hard rules must hold, soft rules are scored and optimized). Runs in seconds for teams under ~100 staff. Output is a draft — the manager reviews on a drag-and-drop grid, the engine live-flags any conflict a manual edit creates, then one tap publishes and notifies everyone.

**Why this wins:** the 2 hours a manager spends every Sunday night with a spreadsheet becomes 5 minutes. That's the demo, the ad, and the onboarding moment.

## Supporting features (recommended)

Ordered roughly by how much they compound the flagship's value:

1. **Availability & time-off requests (v1)** — staff submit from their phone; approved requests feed the generator automatically. Without this, the generator's inputs go stale and the product dies.
2. **Publish & notify (v1)** — push/SMS/email when the schedule drops or a shift changes. Staff see only their shifts; managers see everything.
3. **Shift swaps & open-shift pickup (v1.x)** — staff trade shifts or claim open ones; manager approves with one tap; the engine validates the swap against the same rules (hours, overtime, qualifications). This is the #1 daily pain after schedule creation.
4. **Labor cost meter (v1.x)** — live wage cost of the draft schedule as you build, vs. a budget or (later) projected sales. Managers think in labor %, so this makes the generator speak their language.
5. **Time clock & timesheets (v2)** — clock in/out on a phone or a tablet at the venue (geofence/PIN). Scheduled-vs-actual hours closes the loop and feeds payroll.
6. **Team messaging & announcements (v2)** — lightweight, schedule-anchored ("message tonight's closing crew"). Kills the group-chat chaos without trying to replace Slack.
7. **Shift tasks & checklists (v2)** — opening/closing/side-work lists attached to shifts. Very hospitality-flavored but genuinely generic (retail open/close, clinic room prep).
8. **Payroll & POS integrations (v2.x)** — export timesheets to Gusto/ADP/etc.; import sales from Toast/Square to forecast demand. Integrations are the moat but come after core value is proven.
9. **Hospitality module (v2.x, paid add-on)** — tip pool calculations, section assignments, service-period templates. This is where your bar/restaurant expertise becomes a differentiator without polluting the generic core.

**Deliberately out of scope for now:** full payroll processing, inventory, reservations, HR/onboarding docs. Each is a company in itself.

## Build plan

### Stack (recommendation)

- **Web app first** (managers build schedules on a laptop/tablet), responsive so staff can use it on mobile from day one; native mobile apps follow once swaps/notifications prove out.
- **Frontend:** Next.js + React + TypeScript, Tailwind. Schedule grid is the crown jewel — budget real time for drag-and-drop polish.
- **Backend:** Node/TypeScript (single language across the stack) with Postgres. Row-level multi-tenancy from day one (every table keyed by `org_id`).
- **Scheduling engine:** isolated service/module with a clean API (`inputs → schedule + score + violations`). Start with a greedy assigner + local-search improvement in TypeScript (fast enough for small teams, easy to debug); keep the interface solver-agnostic so we can swap in a real CP-SAT solver (e.g. OR-Tools via a small Python service) when team sizes and rule complexity grow.
- **Notifications:** email first (Resend/Postmark), then push + SMS (Twilio).
- **Hosting:** Vercel + managed Postgres (Neon/Supabase) to start. Boring and cheap.

### Phases

**Phase 0 — Foundation (week 1–2)**
Repo scaffolding, auth (email magic link + Google), org/staff/role data model, invite flow. CI with tests from the first commit.

**Phase 1 — The generator, end to end (week 3–6)**
Demand templates, availability entry, rules config, the solver, and the review grid with manual overrides + conflict flagging. Publish = staff can view their week. **Milestone: a real bar manager (you) schedules a real week in under 10 minutes.** This is the dogfood gate — nothing else proceeds until this feels magic.

**Phase 2 — The staff side (week 7–10)**
Time-off requests, availability self-service, notifications on publish/change, shift-swap requests with rule-validated approval. Labor cost meter on the grid. **Milestone: one full scheduling cycle (generate → publish → swap → regenerate) with zero spreadsheet or group-chat fallback.**

**Phase 3 — Pilot & harden (week 11–14)**
Onboard 3–5 friendly venues from your network (this is your unfair advantage — use it). Instrument everything: time-to-first-schedule, generator acceptance rate (% of generated shifts kept unedited), weekly active managers. Fix what the pilots break. Add CSV import of staff lists to kill onboarding friction.

**Phase 4 — Monetize & expand (week 15+)**
Billing (Stripe): free for tiny teams (≤10 staff), per-active-staff-member pricing above that. Time clock, checklists, first payroll export, and the hospitality add-on module — sequenced by what pilots ask for loudest.

### Success metrics to watch from day one

- **Generator acceptance rate** — if managers rewrite most of what the engine produces, the flagship is failing regardless of signups.
- **Time from signup to first published schedule** — target under 30 minutes including staff data entry.
- **Week-2 retention of managers** — scheduling is weekly; if they don't come back for week two, nothing else matters.

### Risks

- **Cold-start data entry** (staff, availability, templates) is the biggest churn risk — invest early in import tools and sane defaults.
- **The grid must be excellent.** Even with generation, managers judge the product by how the manual-edit experience feels.
- **Crowded market.** The wedge is speed-to-schedule + operator-built credibility, not feature count. Stay narrow until the generator is undeniably better than doing it by hand.
