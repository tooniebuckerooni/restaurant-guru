# Manager Settings Catalog

The manager-side option surface, built out over time. Principle from FLOWS.md stands: **every option ships with a sane default** — a manager can ignore all of this and still publish a schedule in their first session. Depth is for the ones who want it.

Legend: ✅ built (demo and/or app) · 🔜 committed scope (PLAN.md) · 💡 backlog (BACKLOG.md)

## Venue & organization
- ✅ Business name
- ✅ Schedule cadence (weekly / biweekly; monthly 🔜)
- 🔜 Week starts on (Mon/Sun/any)
- 🔜 Time zone; time format (12/24h); currency
- 🔜 Industry template pack (restaurant/bar preset vs. generic)
- 💡 Multiple locations; shared staff pool across locations
- 💡 Departments (FOH/BOH) grouping roles

## Roles
- ✅ Add / rename / remove roles
- ✅ Per-role grid color (auto-assigned from the 8-hue palette)
- 🔜 Role color picker; role sort order on the grid
- 💡 Skill tiers within a role (senior/junior); min-tier requirements per shift
- 💡 Role-specific certifications required (alcohol service, food handler) with expiry tracking

## Staff
- ✅ Add / edit / remove staff
- ✅ Multiple roles per person
- ✅ Wage per hour; target hours/week; max hours/week
- ✅ Weekly availability per day (Off / Days / Evenings / All day presets)
- 🔜 Custom availability time ranges; split availability (two windows a day)
- 🔜 Approved time off (feeds the generator); time-off request workflow
- 🔜 Per-person max shifts/week; min hours/week; seniority date
- 🔜 Contact info; invite/deactivate (auth); preferred language
- 💡 Per-person "never schedule with X" / pairing preferences
- 💡 Attendance history (no-shows, lates) visible at assignment time
- 💡 Overtime pay multiplier per person or org

## Demand template (weekly shifts)
- ✅ Per-weekday shift rows: role × time range × headcount
- ✅ Shifts crossing midnight (until 2 AM+)
- ✅ Add/remove rows per day
- 🔜 Copy day → other days; named week templates ("Standard", "Holiday", "Patio season")
- 🔜 Shift notes ("VIP party at 8"); named shifts ("Brunch", "Close")
- 🔜 Event overlays: one-off demand spikes layered on the template
- 💡 Demand scaling dial (quiet/normal/slammed); sales-forecast-driven demand (POS import)
- 💡 On-call shifts; multi-role shifts (host 5–7, server 7–close)

## Scheduling rules — hard (never broken)
- ✅ Minimum rest between shifts (no-clopen), with allow-clopens override
- ✅ Max hours per week (per person, scaled to period length)
- ✅ Max hours per day
- ✅ Max consecutive days worked
- ✅ Role qualification; availability; time off
- 🔜 Required breaks inside long shifts (paid/unpaid, length, threshold)
- 🔜 Minor labor rules (under-18 hour limits)
- 🔜 Blackout dates for time-off requests
- 💡 Fair Workweek compliance pack (advance-notice warnings by jurisdiction)

## Scheduling preferences — soft (optimized, not guaranteed)
- ✅ Keep everyone near target hours
- ✅ Spread weekend shifts fairly (toggle)
- ✅ Prefer lower-cost staff when otherwise tied (toggle)
- 🔜 Honor preferred shifts/days; respect seniority for prime shifts
- 🔜 Keep shift patterns stable week to week (minimize churn vs. last week)
- 💡 Optimization priority slider: cost ⟷ fairness ⟷ stability

## Budget & reporting
- ✅ Weekly labor budget (scales with cadence) with over-budget warning
- ✅ Overtime warning threshold (hours/week)
- ✅ Live stats: total hours, labor cost, open shifts, warnings; hours-vs-target meters
- 🔜 Labor % vs. projected sales; per-role and per-day cost breakdowns
- 🔜 CSV/PDF exports; scheduled-vs-actual (needs time clock)

## Publishing & notifications
- ✅ Draft/published state; publish action
- 🔜 Notify on publish (push/SMS/email per staff preference); re-notify only affected people on changes
- 🔜 Shift reminders ("you're on in 2 hours") with configurable lead time
- 🔜 Pre-generation availability nudge to staff
- 💡 Auto-publish on a schedule ("every Thursday 5 PM")

## Swaps & coverage
- 🔜 Shift swaps: staff-proposed, engine-validated, manager-approved
- 🔜 Open-shift pickup board; "find cover" blast for sick calls
- 🔜 Auto-approve toggle for pre-validated swaps
- 💡 Chronic-unfilled-shift hiring hook (draft a job post)

## Communication
- ✅ Team chat (demo: device-local; app: real-time, v2)
- ✅ 86 board — out-of-stock items staff see instantly
- 🔜 Announcements (one-way, schedule-anchored: "message tonight's closing crew")
- 🔜 Shift handover / manager logbook
- 💡 Pre-shift lineup sheet auto-generated per day

## Display & output
- ✅ Print / PDF (landscape, chrome stripped)
- ✅ Light/dark theme
- 🔜 Grid density (compact/comfortable); group grid by role vs. by person; staff-visible wage hiding
- 🔜 Calendar sync (iCal feed per staff member)
- 🔜 Staff-side language (Spanish first)

**Count check:** ~70 concrete options cataloged; the remaining ~30 arrive with modules that carry their own settings (time clock, integrations, hospitality pack, multi-location). The gate for building each one stays the same: a pilot manager asked for it, or it protects the generator's quality.
