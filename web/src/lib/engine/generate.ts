import type {
  GenerationInput,
  GenerationResult,
  Slot,
  StaffMember,
  StaffTotals,
  TimeRange,
  Warning,
  Weekday,
} from "./types";

/**
 * Schedule generator: greedy assignment ordered by constrainedness, then a
 * local-improvement pass. Hard rules are never violated — a slot stays open
 * (staffId null) rather than break one. Soft goals (target hours, fairness)
 * shape candidate scoring.
 */

const MINUTES_PER_HOUR = 60;

export function weekdayOf(isoDate: string): Weekday {
  // ISO weekday, shifted so 0 = Monday.
  const d = new Date(`${isoDate}T00:00:00Z`);
  return (((d.getUTCDay() + 6) % 7) as Weekday);
}

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

function rangeHours(r: TimeRange): number {
  return (r.end - r.start) / MINUTES_PER_HOUR;
}

function coveredBy(shift: TimeRange, windows: TimeRange[]): boolean {
  return windows.some((w) => w.start <= shift.start && shift.end <= w.end);
}

const DAY_MINUTES = 24 * MINUTES_PER_HOUR;

/**
 * A shift belongs to its start date; both shifts and availability windows may
 * run past midnight (end > 1440, e.g. "evenings until 2am"). A window that
 * extends past 1440 covers the overflow directly. Failing that, a shift that
 * crosses midnight is also covered by today's window reaching midnight plus
 * tomorrow's window covering the remainder.
 */
function availabilityCovers(staff: StaffMember, date: string, shift: TimeRange): boolean {
  const windows = staff.availability[weekdayOf(date)];
  if (!windows) return false;
  if (coveredBy(shift, windows)) return true;
  if (shift.end <= DAY_MINUTES) return false;
  if (!coveredBy({ start: shift.start, end: DAY_MINUTES }, windows)) return false;
  const nextWindows = staff.availability[((weekdayOf(date) + 1) % 7) as Weekday];
  return nextWindows !== undefined && coveredBy({ start: 0, end: shift.end - DAY_MINUTES }, nextWindows);
}

interface Ctx {
  hoursByStaff: Map<string, number>;
  slotsByStaff: Map<string, Slot[]>;
  weekendShiftsByStaff: Map<string, number>;
}

function isWeekend(date: string): boolean {
  const wd = weekdayOf(date);
  return wd === 4 || wd === 5 || wd === 6; // Fri/Sat/Sun: hospitality weekend
}

/** Absolute start/end in minutes from period day 0, for rest-gap math. */
function absoluteRange(dates: string[], slot: Slot): TimeRange {
  const dayIndex = dates.indexOf(slot.date);
  const base = dayIndex * 24 * MINUTES_PER_HOUR;
  return { start: base + slot.range.start, end: base + slot.range.end };
}

/** Returns a human-readable reason the assignment is illegal, or null if OK. */
function hardRuleViolation(
  input: GenerationInput,
  ctx: Ctx,
  staff: StaffMember,
  slot: Slot,
): string | null {
  if (!staff.roleIds.includes(slot.roleId)) return "not qualified for this role";
  if (staff.timeOff.includes(slot.date)) return "approved time off";
  if (!availabilityCovers(staff, slot.date, slot.range)) return "outside availability";
  // Weekly max hours (period may exceed a week; cap scales with period length).
  const capHours = (staff.maxHoursPerWeek * input.dates.length) / 7;
  const already = ctx.hoursByStaff.get(staff.id) ?? 0;
  if (already + rangeHours(slot.range) > capHours + 1e-9) {
    return `over max hours (${staff.maxHoursPerWeek}h/wk)`;
  }

  const mine = ctx.slotsByStaff.get(staff.id) ?? [];
  const abs = absoluteRange(input.dates, slot);
  for (const other of mine) {
    const otherAbs = absoluteRange(input.dates, other);
    if (overlaps(abs, otherAbs)) return "double-booked";
    // Rest gap between shifts (the no-clopen rule).
    if (!input.rules.allowClopens) {
      const gap =
        abs.start >= otherAbs.end
          ? abs.start - otherAbs.end
          : otherAbs.start - abs.end;
      if (gap >= 0 && gap < input.rules.minRestHours * MINUTES_PER_HOUR) {
        return `under ${input.rules.minRestHours}h rest between shifts`;
      }
    }
  }
  return null;
}

function violatesHardRules(
  input: GenerationInput,
  ctx: Ctx,
  staff: StaffMember,
  slot: Slot,
): boolean {
  return hardRuleViolation(input, ctx, staff, slot) !== null;
}

/** Rebuild assignment context from an existing set of slots. */
function ctxFromSlots(input: GenerationInput, slots: Slot[]): Ctx {
  const ctx: Ctx = {
    hoursByStaff: new Map(),
    slotsByStaff: new Map(),
    weekendShiftsByStaff: new Map(),
  };
  for (const slot of slots) {
    if (slot.staffId === null) continue;
    const staff = input.staff.find((s) => s.id === slot.staffId);
    if (staff) assign(ctx, slot, staff);
  }
  return ctx;
}

export interface EligibilityEntry {
  staffId: string;
  /** null = assignable; otherwise why not. */
  blockedReason: string | null;
  currentHours: number;
}

/**
 * For a manual edit: can `staffId` take `slotId` given the schedule as it
 * stands? Returns null when legal, else the reason. Pass every slot in the
 * schedule; the target slot's current assignee is ignored.
 */
export function checkAssignment(
  input: GenerationInput,
  slots: Slot[],
  slotId: string,
  staffId: string,
): string | null {
  const target = slots.find((s) => s.id === slotId);
  if (!target) return "unknown shift";
  const staff = input.staff.find((s) => s.id === staffId);
  if (!staff) return "unknown staff member";
  const others = slots.filter((s) => s.id !== slotId);
  const ctx = ctxFromSlots(input, others);
  return hardRuleViolation(input, ctx, staff, { ...target, staffId: null });
}

/** Every staff member's eligibility for a slot, for reassignment pickers. */
export function eligibilityFor(
  input: GenerationInput,
  slots: Slot[],
  slotId: string,
): EligibilityEntry[] {
  const others = slots.filter((s) => s.id !== slotId);
  const ctx = ctxFromSlots(input, others);
  return input.staff.map((staff) => ({
    staffId: staff.id,
    blockedReason: checkAssignment(input, slots, slotId, staff.id),
    currentHours: ctx.hoursByStaff.get(staff.id) ?? 0,
  }));
}

/** Lower score = better candidate. Soft preferences only. */
function candidateScore(ctx: Ctx, staff: StaffMember, slot: Slot): number {
  const hours = ctx.hoursByStaff.get(staff.id) ?? 0;
  // Distance below target is good (we want to fill them up); above is bad.
  const targetGap = hours + rangeHours(slot.range) - staff.targetHoursPerWeek;
  const targetPenalty = targetGap > 0 ? targetGap * 3 : targetGap;
  // Spread weekend shifts around.
  const weekendPenalty = isWeekend(slot.date)
    ? (ctx.weekendShiftsByStaff.get(staff.id) ?? 0) * 2
    : 0;
  return targetPenalty + weekendPenalty;
}

function eligibleStaff(
  input: GenerationInput,
  ctx: Ctx,
  slot: Slot,
): StaffMember[] {
  return input.staff.filter((s) => !violatesHardRules(input, ctx, s, slot));
}

function assign(ctx: Ctx, slot: Slot, staff: StaffMember): void {
  slot.staffId = staff.id;
  ctx.hoursByStaff.set(
    staff.id,
    (ctx.hoursByStaff.get(staff.id) ?? 0) + rangeHours(slot.range),
  );
  const mine = ctx.slotsByStaff.get(staff.id) ?? [];
  mine.push(slot);
  ctx.slotsByStaff.set(staff.id, mine);
  if (isWeekend(slot.date)) {
    ctx.weekendShiftsByStaff.set(
      staff.id,
      (ctx.weekendShiftsByStaff.get(staff.id) ?? 0) + 1,
    );
  }
}

function unassign(ctx: Ctx, slot: Slot, staff: StaffMember): void {
  slot.staffId = null;
  ctx.hoursByStaff.set(
    staff.id,
    (ctx.hoursByStaff.get(staff.id) ?? 0) - rangeHours(slot.range),
  );
  ctx.slotsByStaff.set(
    staff.id,
    (ctx.slotsByStaff.get(staff.id) ?? []).filter((s) => s.id !== slot.id),
  );
  if (isWeekend(slot.date)) {
    ctx.weekendShiftsByStaff.set(
      staff.id,
      (ctx.weekendShiftsByStaff.get(staff.id) ?? 0) - 1,
    );
  }
}

export function generateSchedule(input: GenerationInput): GenerationResult {
  const startedAt = performance.now();

  // Expand requirements into individual seats.
  const slots: Slot[] = input.requirements.flatMap((req) =>
    Array.from({ length: req.count }, (_, i) => ({
      id: `${req.id}#${i}`,
      requirementId: req.id,
      date: req.date,
      roleId: req.roleId,
      range: req.range,
      staffId: null,
    })),
  );

  const ctx: Ctx = {
    hoursByStaff: new Map(),
    slotsByStaff: new Map(),
    weekendShiftsByStaff: new Map(),
  };

  // Most-constrained slots first: fewest eligible candidates.
  const ordered = [...slots].sort(
    (a, b) =>
      eligibleStaff(input, ctx, a).length -
      eligibleStaff(input, ctx, b).length,
  );

  for (const slot of ordered) {
    const candidates = eligibleStaff(input, ctx, slot);
    if (candidates.length === 0) continue;
    candidates.sort(
      (a, b) => candidateScore(ctx, a, slot) - candidateScore(ctx, b, slot),
    );
    assign(ctx, slot, candidates[0]);
  }

  // Improvement pass: try to fill open slots by moving a blocking assignment
  // elsewhere. One sweep is enough at small-team scale.
  for (const open of slots.filter((s) => s.staffId === null)) {
    for (const donorSlot of slots.filter((s) => s.staffId !== null)) {
      const donor = input.staff.find((st) => st.id === donorSlot.staffId)!;
      unassign(ctx, donorSlot, donor);
      const canCoverOpen = !violatesHardRules(input, ctx, donor, open);
      const replacement = eligibleStaff(input, ctx, donorSlot).filter(
        (s) => s.id !== donor.id,
      );
      if (canCoverOpen && replacement.length > 0) {
        assign(ctx, open, donor);
        replacement.sort(
          (a, b) =>
            candidateScore(ctx, a, donorSlot) -
            candidateScore(ctx, b, donorSlot),
        );
        assign(ctx, donorSlot, replacement[0]);
        break;
      }
      assign(ctx, donorSlot, donor);
    }
  }

  return {
    slots,
    ...summarize(input.staff, input.dates, slots, input.rules.budgetCents),
    elapsedMs: performance.now() - startedAt,
  };
}

/**
 * Totals and warnings from a set of slots. Pure and slot-derived so the UI
 * can re-summarize after manual edits without regenerating.
 */
export function summarize(
  staffList: StaffMember[],
  dates: string[],
  slots: Slot[],
  budgetCents?: number,
): Omit<GenerationResult, "slots" | "elapsedMs"> {
  const warnings: Warning[] = [];
  const totalsByStaff: StaffTotals[] = staffList.map((s) => {
    const mine = slots.filter((slot) => slot.staffId === s.id);
    const hours = mine.reduce((sum, slot) => sum + rangeHours(slot.range), 0);
    return {
      staffId: s.id,
      hours,
      costCents: Math.round(hours * s.wageCents),
      shiftCount: mine.length,
    };
  });

  for (const slot of slots.filter((s) => s.staffId === null)) {
    warnings.push({
      kind: "unfilled",
      message: `Open shift: ${slot.roleId} on ${slot.date}`,
      slotId: slot.id,
    });
  }
  for (const t of totalsByStaff) {
    const staff = staffList.find((s) => s.id === t.staffId)!;
    const periodTarget = (staff.targetHoursPerWeek * dates.length) / 7;
    if (t.hours > periodTarget + 4) {
      warnings.push({
        kind: "over-target-hours",
        message: `${staff.name} is ${(t.hours - periodTarget).toFixed(1)}h over target`,
        staffId: staff.id,
      });
    } else if (t.shiftCount > 0 && t.hours < periodTarget - 8) {
      warnings.push({
        kind: "under-target-hours",
        message: `${staff.name} is ${(periodTarget - t.hours).toFixed(1)}h under target`,
        staffId: staff.id,
      });
    }
  }

  const totalHours = totalsByStaff.reduce((sum, t) => sum + t.hours, 0);
  const totalCostCents = totalsByStaff.reduce((sum, t) => sum + t.costCents, 0);
  if (budgetCents !== undefined && totalCostCents > budgetCents) {
    warnings.push({
      kind: "over-budget",
      message: `Labor cost $${(totalCostCents / 100).toFixed(0)} exceeds budget $${(budgetCents / 100).toFixed(0)}`,
    });
  }

  return {
    warnings,
    totalsByStaff,
    totalHours,
    totalCostCents,
    openSlotCount: slots.filter((s) => s.staffId === null).length,
  };
}
