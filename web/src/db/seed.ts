import type { Database } from "better-sqlite3";
import { demoRoles, demoStaff } from "@/lib/demo";
import type { TimeRange, Weekday } from "@/lib/engine/types";

export const DEMO_ORG_ID = "amber-room";

const h = (hours: number) => hours * 60;

interface TemplateEntry {
  weekday: Weekday;
  roleId: string;
  range: TimeRange;
  count: number;
}

/** Standard week at The Amber Room. Mirrors lib/demo.ts needsFor(). */
function templateEntries(): TemplateEntry[] {
  const out: TemplateEntry[] = [];
  for (let wd = 0 as number; wd < 7; wd++) {
    const weekday = wd as Weekday;
    const busy = weekday === 4 || weekday === 5;
    const weekend = busy || weekday === 6;
    out.push(
      { weekday, roleId: "kitchen", range: { start: h(10), end: h(16) }, count: 1 },
      { weekday, roleId: "kitchen", range: { start: h(16), end: h(22) }, count: 1 },
      { weekday, roleId: "bartender", range: { start: h(16), end: busy ? h(26) : h(24) }, count: busy ? 2 : 1 },
      { weekday, roleId: "server", range: { start: h(17), end: h(23) }, count: busy ? 3 : 2 },
    );
    if (weekend) out.push({ weekday, roleId: "host", range: { start: h(17), end: h(22) }, count: 1 });
    if (busy) out.push({ weekday, roleId: "barback", range: { start: h(18), end: h(24) }, count: 1 });
  }
  return out;
}

export function seedIfEmpty(db: Database): void {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM orgs").get() as { n: number };
  if (existing.n > 0) return;

  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO orgs (id, name, cadence, min_rest_hours, allow_clopens, budget_cents) VALUES (?, ?, 'weekly', 10, 0, 500000)",
    ).run(DEMO_ORG_ID, "The Amber Room");

    const insertRole = db.prepare(
      "INSERT INTO roles (id, org_id, name, color_key) VALUES (?, ?, ?, ?)",
    );
    for (const role of demoRoles) {
      insertRole.run(role.id, DEMO_ORG_ID, role.name, role.colorKey);
    }

    const insertStaff = db.prepare(
      `INSERT INTO staff (id, org_id, name, role_ids, wage_cents, max_hours_per_week,
        target_hours_per_week, availability, time_off)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const s of demoStaff) {
      insertStaff.run(
        s.id,
        DEMO_ORG_ID,
        s.name,
        JSON.stringify(s.roleIds),
        s.wageCents,
        s.maxHoursPerWeek,
        s.targetHoursPerWeek,
        JSON.stringify(s.availability),
        JSON.stringify(s.timeOff),
      );
    }

    const insertNeed = db.prepare(
      `INSERT INTO demand_template (id, org_id, weekday, role_id, start_min, end_min, count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    templateEntries().forEach((e, i) => {
      insertNeed.run(`t${i}`, DEMO_ORG_ID, e.weekday, e.roleId, e.range.start, e.range.end, e.count);
    });
  });
  tx();
}
