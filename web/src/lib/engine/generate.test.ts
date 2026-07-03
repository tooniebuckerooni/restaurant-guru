import { describe, expect, it } from "vitest";
import { generateSchedule, weekdayOf } from "./generate";
import type { GenerationInput, StaffMember } from "./types";

const ALL_DAY = [{ start: 0, end: 24 * 60 }];
const WEEK = [
  "2026-07-06", // Mon
  "2026-07-07",
  "2026-07-08",
  "2026-07-09",
  "2026-07-10",
  "2026-07-11",
  "2026-07-12", // Sun
];

function staff(overrides: Partial<StaffMember> & { id: string }): StaffMember {
  return {
    name: overrides.id,
    roleIds: ["bartender"],
    wageCents: 2000,
    maxHoursPerWeek: 40,
    targetHoursPerWeek: 32,
    availability: { 0: ALL_DAY, 1: ALL_DAY, 2: ALL_DAY, 3: ALL_DAY, 4: ALL_DAY, 5: ALL_DAY, 6: ALL_DAY },
    timeOff: [],
    ...overrides,
  };
}

function baseInput(overrides: Partial<GenerationInput> = {}): GenerationInput {
  return {
    dates: WEEK,
    roles: [{ id: "bartender", name: "Bartender", colorKey: "bartender" }],
    staff: [staff({ id: "ava" }), staff({ id: "sam" })],
    requirements: [],
    rules: { minRestHours: 10, allowClopens: false },
    ...overrides,
  };
}

describe("weekdayOf", () => {
  it("maps Monday to 0 and Sunday to 6", () => {
    expect(weekdayOf("2026-07-06")).toBe(0);
    expect(weekdayOf("2026-07-12")).toBe(6);
  });
});

describe("generateSchedule", () => {
  it("fills a simple requirement with an eligible person", () => {
    const result = generateSchedule(
      baseInput({
        requirements: [
          { id: "r1", date: "2026-07-10", roleId: "bartender", range: { start: 16 * 60, end: 24 * 60 }, count: 2 },
        ],
      }),
    );
    expect(result.openSlotCount).toBe(0);
    expect(new Set(result.slots.map((s) => s.staffId)).size).toBe(2);
    expect(result.totalHours).toBe(16);
  });

  it("never assigns outside availability or on time off", () => {
    const result = generateSchedule(
      baseInput({
        staff: [
          staff({ id: "ava", availability: { 0: ALL_DAY } }), // Mondays only
          staff({ id: "sam", timeOff: ["2026-07-10"] }),
        ],
        requirements: [
          { id: "r1", date: "2026-07-10", roleId: "bartender", range: { start: 16 * 60, end: 22 * 60 }, count: 2 },
        ],
      }),
    );
    // Only nobody or sam... sam is off, ava unavailable Friday: both seats open.
    expect(result.openSlotCount).toBe(2);
    expect(result.warnings.filter((w) => w.kind === "unfilled")).toHaveLength(2);
  });

  it("never double-books overlapping shifts", () => {
    const result = generateSchedule(
      baseInput({
        staff: [staff({ id: "ava" })],
        requirements: [
          { id: "r1", date: "2026-07-10", roleId: "bartender", range: { start: 16 * 60, end: 22 * 60 }, count: 1 },
          { id: "r2", date: "2026-07-10", roleId: "bartender", range: { start: 18 * 60, end: 23 * 60 }, count: 1 },
        ],
      }),
    );
    const assigned = result.slots.filter((s) => s.staffId === "ava");
    expect(assigned).toHaveLength(1);
    expect(result.openSlotCount).toBe(1);
  });

  it("respects weekly max hours", () => {
    const result = generateSchedule(
      baseInput({
        staff: [staff({ id: "ava", maxHoursPerWeek: 10 })],
        requirements: WEEK.map((date, i) => ({
          id: `r${i}`,
          date,
          roleId: "bartender",
          range: { start: 16 * 60, end: 22 * 60 }, // 6h each
          count: 1,
        })),
      }),
    );
    const avaHours = result.totalsByStaff.find((t) => t.staffId === "ava")!.hours;
    expect(avaHours).toBeLessThanOrEqual(10);
  });

  it("blocks clopens when disallowed and allows them when allowed", () => {
    const close = { id: "close", date: "2026-07-10", roleId: "bartender", range: { start: 18 * 60, end: 26 * 60 }, count: 1 }; // ends 2am
    const open = { id: "open", date: "2026-07-11", roleId: "bartender", range: { start: 9 * 60, end: 15 * 60 }, count: 1 }; // starts 9am → 7h gap
    const strict = generateSchedule(
      baseInput({ staff: [staff({ id: "ava" })], requirements: [close, open] }),
    );
    expect(strict.slots.filter((s) => s.staffId === "ava")).toHaveLength(1);

    const loose = generateSchedule(
      baseInput({
        staff: [staff({ id: "ava" })],
        requirements: [close, open],
        rules: { minRestHours: 10, allowClopens: true },
      }),
    );
    expect(loose.slots.filter((s) => s.staffId === "ava")).toHaveLength(2);
  });

  it("only assigns qualified roles", () => {
    const result = generateSchedule(
      baseInput({
        roles: [
          { id: "bartender", name: "Bartender", colorKey: "bartender" },
          { id: "kitchen", name: "Kitchen", colorKey: "kitchen" },
        ],
        staff: [staff({ id: "ava", roleIds: ["bartender"] })],
        requirements: [
          { id: "r1", date: "2026-07-10", roleId: "kitchen", range: { start: 10 * 60, end: 16 * 60 }, count: 1 },
        ],
      }),
    );
    expect(result.openSlotCount).toBe(1);
  });

  it("flags over-budget schedules", () => {
    const result = generateSchedule(
      baseInput({
        requirements: [
          { id: "r1", date: "2026-07-10", roleId: "bartender", range: { start: 16 * 60, end: 24 * 60 }, count: 2 },
        ],
        rules: { minRestHours: 10, allowClopens: false, budgetCents: 10000 }, // $100 budget, 16h * $20 = $320
      }),
    );
    expect(result.warnings.some((w) => w.kind === "over-budget")).toBe(true);
  });

  it("spreads hours toward targets across staff", () => {
    const result = generateSchedule(
      baseInput({
        staff: [staff({ id: "ava" }), staff({ id: "sam" }), staff({ id: "maya" })],
        requirements: WEEK.map((date, i) => ({
          id: `r${i}`,
          date,
          roleId: "bartender",
          range: { start: 16 * 60, end: 22 * 60 },
          count: 2,
        })),
      }),
    );
    expect(result.openSlotCount).toBe(0);
    const hours = result.totalsByStaff.map((t) => t.hours);
    // 84 total hours across 3 people with 32h targets: nobody should hog.
    expect(Math.max(...hours) - Math.min(...hours)).toBeLessThanOrEqual(12);
  });

  it("supports non-weekly periods (biweekly)", () => {
    const dates = [
      ...WEEK,
      "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17", "2026-07-18", "2026-07-19",
    ];
    const result = generateSchedule(
      baseInput({
        dates,
        staff: [staff({ id: "ava", maxHoursPerWeek: 10 })],
        requirements: dates.map((date, i) => ({
          id: `r${i}`,
          date,
          roleId: "bartender",
          range: { start: 16 * 60, end: 21 * 60 }, // 5h
          count: 1,
        })),
      }),
    );
    const avaHours = result.totalsByStaff.find((t) => t.staffId === "ava")!.hours;
    // Cap scales with period length: 10h/wk * 2wk = 20h.
    expect(avaHours).toBeLessThanOrEqual(20);
  });

  it("checkAssignment explains why a reassignment is illegal", async () => {
    const { checkAssignment } = await import("./generate");
    const input = baseInput({
      staff: [staff({ id: "ava" }), staff({ id: "sam", roleIds: ["kitchen"] })],
      requirements: [
        { id: "r1", date: "2026-07-10", roleId: "bartender", range: { start: 16 * 60, end: 22 * 60 }, count: 1 },
      ],
    });
    const result = generateSchedule(input);
    const slotId = result.slots[0].id;
    expect(checkAssignment(input, result.slots, slotId, "ava")).toBeNull();
    expect(checkAssignment(input, result.slots, slotId, "sam")).toMatch(/not qualified/);
  });

  it("eligibilityFor lists blocked reasons per staff member", async () => {
    const { eligibilityFor } = await import("./generate");
    const input = baseInput({
      staff: [staff({ id: "ava" }), staff({ id: "sam", timeOff: ["2026-07-10"] })],
      requirements: [
        { id: "r1", date: "2026-07-10", roleId: "bartender", range: { start: 16 * 60, end: 22 * 60 }, count: 1 },
      ],
    });
    const result = generateSchedule(input);
    const entries = eligibilityFor(input, result.slots, result.slots[0].id);
    expect(entries.find((e) => e.staffId === "ava")!.blockedReason).toBeNull();
    expect(entries.find((e) => e.staffId === "sam")!.blockedReason).toMatch(/time off/);
  });

  it("reports elapsed time", () => {
    const result = generateSchedule(baseInput());
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
  });
});
