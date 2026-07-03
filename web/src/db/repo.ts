import { randomUUID } from "node:crypto";
import { getDb } from "./index";
import type {
  GenerationInput,
  GenerationResult,
  RoleDef,
  ShiftRequirement,
  Slot,
  StaffMember,
  Weekday,
} from "@/lib/engine/types";

/** All SQL lives here; callers speak engine/domain types only. */

export interface OrgSettings {
  id: string;
  name: string;
  cadence: "weekly" | "biweekly" | "monthly";
  minRestHours: number;
  allowClopens: boolean;
  budgetCents?: number;
}

export interface ScheduleMeta {
  id: string;
  startDate: string;
  days: number;
  status: "draft" | "published";
  generatedMs: number | null;
}

interface OrgRow {
  id: string;
  name: string;
  cadence: OrgSettings["cadence"];
  min_rest_hours: number;
  allow_clopens: number;
  budget_cents: number | null;
}

interface StaffRow {
  id: string;
  name: string;
  role_ids: string;
  wage_cents: number;
  max_hours_per_week: number;
  target_hours_per_week: number;
  availability: string;
  time_off: string;
}

interface SlotRow {
  id: string;
  requirement_id: string;
  date: string;
  role_id: string;
  start_min: number;
  end_min: number;
  staff_id: string | null;
}

export function getOrg(orgId: string): OrgSettings {
  const row = getDb()
    .prepare("SELECT * FROM orgs WHERE id = ?")
    .get(orgId) as OrgRow | undefined;
  if (!row) throw new Error(`Unknown org ${orgId}`);
  return {
    id: row.id,
    name: row.name,
    cadence: row.cadence,
    minRestHours: row.min_rest_hours,
    allowClopens: row.allow_clopens === 1,
    budgetCents: row.budget_cents ?? undefined,
  };
}

export function getRoles(orgId: string): RoleDef[] {
  const rows = getDb()
    .prepare("SELECT id, name, color_key FROM roles WHERE org_id = ?")
    .all(orgId) as { id: string; name: string; color_key: string }[];
  return rows.map((r) => ({ id: r.id, name: r.name, colorKey: r.color_key }));
}

export function getStaff(orgId: string): StaffMember[] {
  const rows = getDb()
    .prepare("SELECT * FROM staff WHERE org_id = ? AND active = 1")
    .all(orgId) as StaffRow[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    roleIds: JSON.parse(r.role_ids),
    wageCents: r.wage_cents,
    maxHoursPerWeek: r.max_hours_per_week,
    targetHoursPerWeek: r.target_hours_per_week,
    availability: JSON.parse(r.availability),
    timeOff: JSON.parse(r.time_off),
  }));
}

/** Expand the org's demand template over concrete dates. */
export function requirementsFor(orgId: string, dates: string[]): ShiftRequirement[] {
  const rows = getDb()
    .prepare("SELECT * FROM demand_template WHERE org_id = ?")
    .all(orgId) as {
    id: string;
    weekday: number;
    role_id: string;
    start_min: number;
    end_min: number;
    count: number;
  }[];
  return dates.flatMap((date) => {
    const wd = ((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7) as Weekday;
    return rows
      .filter((r) => r.weekday === wd)
      .map((r) => ({
        id: `${r.id}@${date}`,
        date,
        roleId: r.role_id,
        range: { start: r.start_min, end: r.end_min },
        count: r.count,
      }));
  });
}

export function generationInput(orgId: string, dates: string[]): GenerationInput {
  const org = getOrg(orgId);
  return {
    dates,
    roles: getRoles(orgId),
    staff: getStaff(orgId),
    requirements: requirementsFor(orgId, dates),
    rules: {
      minRestHours: org.minRestHours,
      allowClopens: org.allowClopens,
      budgetCents: org.budgetCents,
    },
  };
}

export function getSchedule(orgId: string, startDate: string): ScheduleMeta | null {
  const row = getDb()
    .prepare("SELECT * FROM schedules WHERE org_id = ? AND start_date = ?")
    .get(orgId, startDate) as
    | { id: string; start_date: string; days: number; status: "draft" | "published"; generated_ms: number | null }
    | undefined;
  return row
    ? {
        id: row.id,
        startDate: row.start_date,
        days: row.days,
        status: row.status,
        generatedMs: row.generated_ms,
      }
    : null;
}

export function getSlots(scheduleId: string): Slot[] {
  const rows = getDb()
    .prepare("SELECT * FROM slots WHERE schedule_id = ? ORDER BY date, start_min")
    .all(scheduleId) as SlotRow[];
  return rows.map((r) => ({
    id: r.id,
    requirementId: r.requirement_id,
    date: r.date,
    roleId: r.role_id,
    range: { start: r.start_min, end: r.end_min },
    staffId: r.staff_id,
  }));
}

/** Replace a schedule's slots with a generation result (idempotent upsert). */
export function saveGeneration(
  orgId: string,
  startDate: string,
  days: number,
  result: GenerationResult,
): ScheduleMeta {
  const db = getDb();
  const existing = getSchedule(orgId, startDate);
  const scheduleId = existing?.id ?? randomUUID();
  const tx = db.transaction(() => {
    if (existing) {
      db.prepare("DELETE FROM slots WHERE schedule_id = ?").run(scheduleId);
      db.prepare("UPDATE schedules SET status = 'draft', generated_ms = ? WHERE id = ?").run(
        result.elapsedMs,
        scheduleId,
      );
    } else {
      db.prepare(
        "INSERT INTO schedules (id, org_id, start_date, days, status, generated_ms) VALUES (?, ?, ?, ?, 'draft', ?)",
      ).run(scheduleId, orgId, startDate, days, result.elapsedMs);
    }
    const insert = db.prepare(
      `INSERT INTO slots (id, schedule_id, requirement_id, date, role_id, start_min, end_min, staff_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const s of result.slots) {
      insert.run(s.id, scheduleId, s.requirementId, s.date, s.roleId, s.range.start, s.range.end, s.staffId);
    }
  });
  tx();
  return getSchedule(orgId, startDate)!;
}

export function setSlotStaff(scheduleId: string, slotId: string, staffId: string | null): void {
  getDb()
    .prepare("UPDATE slots SET staff_id = ? WHERE schedule_id = ? AND id = ?")
    .run(staffId, scheduleId, slotId);
}

export function setScheduleStatus(scheduleId: string, status: "draft" | "published"): void {
  getDb().prepare("UPDATE schedules SET status = ? WHERE id = ?").run(status, scheduleId);
}

/** Shifts for one staff member across published schedules (and drafts if asked). */
export function slotsForStaff(orgId: string, staffId: string, includeDrafts = false): Slot[] {
  const rows = getDb()
    .prepare(
      `SELECT sl.* FROM slots sl
       JOIN schedules sc ON sc.id = sl.schedule_id
       WHERE sc.org_id = ? AND sl.staff_id = ? ${includeDrafts ? "" : "AND sc.status = 'published'"}
       ORDER BY sl.date, sl.start_min`,
    )
    .all(orgId, staffId) as SlotRow[];
  return rows.map((r) => ({
    id: r.id,
    requirementId: r.requirement_id,
    date: r.date,
    roleId: r.role_id,
    range: { start: r.start_min, end: r.end_min },
    staffId: r.staff_id,
  }));
}
