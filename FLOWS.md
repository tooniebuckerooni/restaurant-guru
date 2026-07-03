# User Flows & Access Model

Companion to PLAN.md. The Design kit (claude.ai/design project `41fcef3a`) is the *visual* reference; this document defines what the screens actually do. Where a Design mockup implies a function we haven't committed to, this document wins.

## Access model: one app, two experiences

A single web application with role-based access — not separate apps, not separate sites. Everyone signs in at the same place; what they see after login depends on their role.

**Roles:** Owner → Manager → Shift Lead (later) → Staff. Permissions are additive; an owner can do everything a manager can, etc.

### How managers log in
Email + password or Google sign-in. Managers create the org, so they self-signup. They administer billing, staff, and schedules, and they live on laptop/tablet.

### How staff log in
Staff never self-signup and never choose a password. They exist because a manager added them:

1. Manager adds a staff member (name + phone and/or email) — or shares a **venue join code / QR** posted in the back of house.
2. Staff member gets an SMS/email invite (or scans the QR), taps the link, confirms their name, and verifies with a one-time code.
3. From then on, login is a one-time code to their phone/email — no passwords. Hospitality reality: high churn, shared devices, forgotten passwords. OTP kills the #1 support ticket before it exists.
4. When someone leaves, the manager deactivates them — access dies instantly, their history stays for reports.

Staff land on **My Shifts**; they never see admin navigation. Managers land on the **Schedule Grid**.

## Platform: web app + installable PWA, not a static site

- This cannot be a static site: it needs a database, authentication, per-user views, and notifications. It is a **web application** (dynamic frontend + API + Postgres, per PLAN.md).
- The **marketing/landing page** is the only static part — separate, fast, SEO-friendly.
- The staff experience ships as an **installable PWA**: "Add to Home Screen" gives an app icon, full-screen feel, and push notifications (supported on iOS 16.4+ for installed PWAs, and on Android). SMS remains the notification fallback for staff who won't install anything.
- **Native iOS/Android apps are deferred** until the PWA proves insufficient (deeper push reliability, app-store presence as a sales channel). Nothing in the architecture blocks that later — the API serves whatever client we point at it.

## Manager flows

### First-run onboarding (target: first published schedule in under 30 minutes)
1. Sign up → name the business → pick an industry template (bar/restaurant pre-selected role packs; generic pack for everyone else).
2. Add staff: paste a list / CSV import / add manually. Inviting staff is optional at this step — the manager can schedule first and invite later, so the first schedule doesn't wait on anyone else.
3. Build the demand template with a visual week painter: tap a day, add shifts by role and headcount. Prefilled sensible defaults from the industry template so they edit rather than create from blank.
4. Set the rules that matter (max hours, no-clopen toggle, budget) and the **schedule cadence** — weekly, biweekly, or monthly. Everything else defaults on. Setup is where the option depth lives; it's done once and revisited rarely.
5. **Generate.** The first "whoa" moment. Review on the grid, drag to adjust, publish. A **Print / PDF** button sits beside Publish — first-class, not buried in a menu.

### The per-period loop (the habit)
1. Open the app → the next period's draft already exists (auto-created from the demand template on the org's cadence — weekly, biweekly, or monthly — or one tap to copy last period). The target: by the time the next schedule is due, it's a quick click and a few adjustments, if any.
2. A **"what changed" strip** sits above the grid: new time-off requests, availability changes, staff joined/left. Approve/acknowledge inline — these feed the generator before it runs, so the manager never publishes against stale reality.
3. Generate (or repair the copied week). Conflicts and warnings appear as badges on the affected shifts, with one-tap fixes ("swap in someone eligible").
4. Glance at the hours panel beside the grid: per-person totals vs. targets, overtime flags, total cost.
5. Publish → everyone is notified automatically. No separate "send" step, no export, no group chat paste. **Print / PDF** is one click from the same toolbar for the kitchen-wall copy.
6. The app shows its receipt: generation time in seconds and a running "hours saved vs. manual scheduling" tally. Speed is the pitch; the product proves it every period.

### Midweek interrupts
- **Swap request:** notification → one tap opens the request with the engine's verdict already computed ("Maria is qualified, stays under 40h") → approve/deny from the notification without opening the grid.
- **Sick call:** open the shift → "Find cover" blasts eligible, available staff → first eligible claimer gets it pending approval (or auto-approve if the manager enables it).

## Staff flows

### Joining (under 2 minutes, no app store)
Invite link or QR → confirm name → verify code → prompted to set weekly availability (skippable, nagged later) → offered "Add to Home Screen" → lands on My Shifts.

### Daily use
My Shifts opens to the **next shift** — day, time, role — with this week and next below it. One glance answers "when do I work?", which is 90% of visits.

### Requests (all self-serve, all feed the generator)
- **Time off:** pick dates → optional note → submitted. Status is visible (pending/approved) — no "did you see my text?" limbo.
- **Availability change:** edit the weekly pattern; takes effect from the next unpublished week, and the manager is notified.
- **Swap/drop:** pick a shift → app shows only eligible coworkers (right role, available, within hour limits) → they accept → manager gets a pre-validated approval. Staff never see why someone is ineligible (no exposing hours/wages) — just who's available.
- **Open shifts:** a claimable board of unfilled shifts; push notification when one matches their role.

## Flow principles (the "improve the user flow" checklist)

1. **Every notification is actionable in one tap** — approve a swap from the lock screen, don't make anyone hunt through menus.
2. **The generator is never blocked by admin debt** — schedule first with placeholder staff if needed; invite/complete data later.
3. **Nothing published goes stale silently** — any post-publish change re-notifies exactly the affected people, nobody else.
4. **Status is always visible** — every request shows pending/approved/denied to its owner; ambiguity breeds side-channel texts.
5. **Defaults over configuration** — industry template pre-fills roles, shifts, and rules; the manager edits, never starts blank.
6. **One system of record** — if a flow ends with "then paste it into the group chat," the flow is unfinished.
