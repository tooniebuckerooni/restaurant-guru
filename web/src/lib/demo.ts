import type {
  GenerationInput,
  RoleDef,
  ShiftRequirement,
  StaffMember,
  TimeRange,
  Weekday,
} from "./engine/types";

/**
 * Demo org: "The Amber Room" — the venue from the design mockups.
 * Stands in for the database until Phase 0 auth + persistence land.
 */

const h = (hours: number, minutes = 0) => hours * 60 + minutes;

const EVENINGS: TimeRange[] = [{ start: h(15), end: h(26) }];
const DAYS: TimeRange[] = [{ start: h(8), end: h(17) }];
const ALL: TimeRange[] = [{ start: h(8), end: h(26) }];

function week(pattern: Partial<Record<Weekday, TimeRange[]>>) {
  return pattern;
}

const everyday = (r: TimeRange[]) =>
  week({ 0: r, 1: r, 2: r, 3: r, 4: r, 5: r, 6: r });

export const demoRoles: RoleDef[] = [
  { id: "bartender", name: "Bartender", colorKey: "bartender" },
  { id: "server", name: "Server", colorKey: "server" },
  { id: "kitchen", name: "Kitchen", colorKey: "kitchen" },
  { id: "host", name: "Host", colorKey: "host" },
  { id: "barback", name: "Barback", colorKey: "barback" },
];

export const demoStaff: StaffMember[] = [
  {
    id: "ava",
    name: "Ava P.",
    roleIds: ["bartender"],
    wageCents: 2200,
    maxHoursPerWeek: 40,
    targetHoursPerWeek: 35,
    availability: week({ 2: EVENINGS, 3: EVENINGS, 4: EVENINGS, 5: EVENINGS, 6: EVENINGS }),
    timeOff: [],
  },
  {
    id: "sam",
    name: "Sam D.",
    roleIds: ["bartender", "barback"],
    wageCents: 2000,
    maxHoursPerWeek: 40,
    targetHoursPerWeek: 32,
    availability: week({ 0: EVENINGS, 1: EVENINGS, 3: EVENINGS, 4: EVENINGS, 5: EVENINGS }),
    timeOff: [],
  },
  {
    id: "nora",
    name: "Nora T.",
    roleIds: ["bartender", "server"],
    wageCents: 2100,
    maxHoursPerWeek: 30,
    targetHoursPerWeek: 24,
    availability: week({ 4: ALL, 5: ALL, 6: ALL }),
    timeOff: [],
  },
  {
    id: "maya",
    name: "Maya R.",
    roleIds: ["server"],
    wageCents: 1700,
    maxHoursPerWeek: 40,
    targetHoursPerWeek: 30,
    availability: everyday(EVENINGS),
    timeOff: [],
  },
  {
    id: "jules",
    name: "Jules F.",
    roleIds: ["server", "host"],
    wageCents: 1700,
    maxHoursPerWeek: 35,
    targetHoursPerWeek: 28,
    availability: week({ 0: ALL, 1: ALL, 2: ALL, 5: EVENINGS, 6: EVENINGS }),
    timeOff: [],
  },
  {
    id: "deja",
    name: "Deja W.",
    roleIds: ["host", "server"],
    wageCents: 1600,
    maxHoursPerWeek: 25,
    targetHoursPerWeek: 20,
    availability: week({ 3: EVENINGS, 4: EVENINGS, 5: EVENINGS, 6: EVENINGS }),
    timeOff: [],
  },
  {
    id: "theo",
    name: "Theo K.",
    roleIds: ["kitchen"],
    wageCents: 1900,
    maxHoursPerWeek: 45,
    targetHoursPerWeek: 40,
    availability: everyday(ALL),
    timeOff: [],
  },
  {
    id: "owen",
    name: "Owen L.",
    roleIds: ["kitchen", "barback"],
    wageCents: 1800,
    maxHoursPerWeek: 40,
    targetHoursPerWeek: 32,
    availability: week({ 0: DAYS, 1: DAYS, 2: ALL, 3: ALL, 4: ALL, 6: ALL }),
    timeOff: [],
  },
];

/** Demand template: what a standard week at the venue needs. */
interface DayNeed {
  roleId: string;
  range: TimeRange;
  count: number;
}

function needsFor(weekday: Weekday): DayNeed[] {
  const busy = weekday === 4 || weekday === 5; // Fri, Sat
  const weekend = busy || weekday === 6;
  return [
    { roleId: "kitchen", range: { start: h(10), end: h(16) }, count: 1 },
    { roleId: "kitchen", range: { start: h(16), end: h(22) }, count: 1 },
    { roleId: "bartender", range: { start: h(16), end: busy ? h(26) : h(24) }, count: busy ? 2 : 1 },
    { roleId: "server", range: { start: h(17), end: h(23) }, count: busy ? 3 : 2 },
    ...(weekend
      ? [{ roleId: "host", range: { start: h(17), end: h(22) }, count: 1 }]
      : []),
    ...(busy
      ? [{ roleId: "barback", range: { start: h(18), end: h(24) }, count: 1 }]
      : []),
  ];
}

/** Next Monday (or today if Monday), as the start of the demo period. */
export function nextPeriodDates(from = new Date(), days = 7): string[] {
  const start = new Date(from);
  const dow = (start.getDay() + 6) % 7; // 0 = Monday
  start.setDate(start.getDate() + ((7 - dow) % 7));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function demoRequirements(dates: string[]): ShiftRequirement[] {
  return dates.flatMap((date, dayIdx) => {
    const wd = (((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7) as Weekday);
    return needsFor(wd).map((need, i) => ({
      id: `d${dayIdx}-${need.roleId}-${i}`,
      date,
      roleId: need.roleId,
      range: need.range,
      count: need.count,
    }));
  });
}

export function demoInput(dates = nextPeriodDates()): GenerationInput {
  return {
    dates,
    roles: demoRoles,
    staff: demoStaff,
    requirements: demoRequirements(dates),
    rules: { minRestHours: 10, allowClopens: false, budgetCents: 500000 },
  };
}
