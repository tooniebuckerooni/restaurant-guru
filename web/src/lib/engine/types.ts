/**
 * Core domain types for the schedule generator.
 *
 * The engine is pure: (inputs) => GenerationResult. No IO, no framework.
 * A "period" is any run of consecutive days — weekly, biweekly, or monthly
 * cadences all produce the same shape, so the engine never assumes 7 days.
 */

/** Day of week: 0 = Monday … 6 = Sunday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Minutes since midnight. A shift may end past 1440 (crosses midnight). */
export interface TimeRange {
  start: number;
  end: number;
}

export type ScheduleCadence = "weekly" | "biweekly" | "monthly";

export interface RoleDef {
  id: string;
  name: string;
  /** Token key into --role-* colors, e.g. "bartender". */
  colorKey: string;
}

export interface StaffMember {
  id: string;
  name: string;
  /** Role ids this person can work. */
  roleIds: string[];
  /** Hourly wage in cents. */
  wageCents: number;
  /** Hard cap per week. */
  maxHoursPerWeek: number;
  /** Soft target per week; generator steers toward it. */
  targetHoursPerWeek: number;
  /**
   * Recurring availability: for each weekday, ranges this person can work.
   * Missing weekday = unavailable that day.
   */
  availability: Partial<Record<Weekday, TimeRange[]>>;
  /** ISO dates (YYYY-MM-DD) of approved time off. */
  timeOff: string[];
}

/** One staffing need: "2 bartenders Friday 16:00–close". Expanded to slots. */
export interface ShiftRequirement {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  roleId: string;
  range: TimeRange;
  /** How many people are needed. */
  count: number;
  note?: string;
}

export interface Rules {
  /** Minimum hours between one shift's end and the next shift's start. */
  minRestHours: number;
  /** Allow a close followed by an open below the rest threshold. */
  allowClopens: boolean;
  /** Optional labor budget for the period, in cents. */
  budgetCents?: number;
}

export interface GenerationInput {
  /** Consecutive ISO dates that make up the period. */
  dates: string[];
  roles: RoleDef[];
  staff: StaffMember[];
  requirements: ShiftRequirement[];
  rules: Rules;
}

/** A single seat on a single shift, assigned or open. */
export interface Slot {
  id: string;
  requirementId: string;
  date: string;
  roleId: string;
  range: TimeRange;
  staffId: string | null;
}

export type WarningKind =
  | "unfilled"
  | "over-budget"
  | "under-target-hours"
  | "over-target-hours";

export interface Warning {
  kind: WarningKind;
  message: string;
  slotId?: string;
  staffId?: string;
}

export interface StaffTotals {
  staffId: string;
  hours: number;
  costCents: number;
  shiftCount: number;
}

export interface GenerationResult {
  slots: Slot[];
  warnings: Warning[];
  totalsByStaff: StaffTotals[];
  totalHours: number;
  totalCostCents: number;
  openSlotCount: number;
  /** Wall-clock generation time in milliseconds. Speed is the brand. */
  elapsedMs: number;
}
