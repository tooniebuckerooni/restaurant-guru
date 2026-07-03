"use server";

import { revalidatePath } from "next/cache";
import {
  checkAssignment,
  eligibilityFor,
  generateSchedule,
} from "@/lib/engine/generate";
import type { RoleDef, Slot, StaffMember } from "@/lib/engine/types";
import { nextPeriodDates } from "@/lib/demo";
import { DEMO_ORG_ID } from "@/db/seed";
import {
  generationInput,
  getOrg,
  getRoles,
  getSchedule,
  getSlots,
  getStaff,
  saveGeneration,
  setScheduleStatus,
  setSlotStaff,
  slotsForStaff,
  type OrgSettings,
  type ScheduleMeta,
} from "@/db/repo";

/**
 * Server actions for the demo org. Once auth lands, the org comes from the
 * session instead of DEMO_ORG_ID and staff actions check roles.
 */

export interface BoardState {
  org: OrgSettings;
  roles: RoleDef[];
  staff: StaffMember[];
  dates: string[];
  schedule: ScheduleMeta | null;
  slots: Slot[];
}

function periodDates(): string[] {
  return nextPeriodDates();
}

export async function loadBoard(): Promise<BoardState> {
  const dates = periodDates();
  const schedule = getSchedule(DEMO_ORG_ID, dates[0]);
  return {
    org: getOrg(DEMO_ORG_ID),
    roles: getRoles(DEMO_ORG_ID),
    staff: getStaff(DEMO_ORG_ID),
    dates,
    schedule,
    slots: schedule ? getSlots(schedule.id) : [],
  };
}

export async function generateDraft(): Promise<BoardState> {
  const dates = periodDates();
  const input = generationInput(DEMO_ORG_ID, dates);
  const result = generateSchedule(input);
  saveGeneration(DEMO_ORG_ID, dates[0], dates.length, result);
  revalidatePath("/");
  return loadBoard();
}

export interface EligibleOption {
  staffId: string;
  name: string;
  blockedReason: string | null;
  currentHours: number;
}

export async function eligibleForSlot(slotId: string): Promise<EligibleOption[]> {
  const dates = periodDates();
  const schedule = getSchedule(DEMO_ORG_ID, dates[0]);
  if (!schedule) return [];
  const input = generationInput(DEMO_ORG_ID, dates);
  const slots = getSlots(schedule.id);
  return eligibilityFor(input, slots, slotId)
    .map((e) => ({
      ...e,
      name: input.staff.find((s) => s.id === e.staffId)!.name,
    }))
    .sort((a, b) => Number(a.blockedReason !== null) - Number(b.blockedReason !== null) || a.currentHours - b.currentHours);
}

export async function assignSlot(
  slotId: string,
  staffId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const dates = periodDates();
  const schedule = getSchedule(DEMO_ORG_ID, dates[0]);
  if (!schedule) return { ok: false, error: "no draft yet" };
  if (staffId !== null) {
    const input = generationInput(DEMO_ORG_ID, dates);
    const slots = getSlots(schedule.id);
    const reason = checkAssignment(input, slots, slotId, staffId);
    if (reason) return { ok: false, error: reason };
  }
  setSlotStaff(schedule.id, slotId, staffId);
  revalidatePath("/");
  return { ok: true };
}

export async function publishSchedule(): Promise<{ ok: boolean }> {
  const dates = periodDates();
  const schedule = getSchedule(DEMO_ORG_ID, dates[0]);
  if (!schedule) return { ok: false };
  setScheduleStatus(schedule.id, "published");
  revalidatePath("/");
  return { ok: true };
}

export interface MyShift {
  date: string;
  roleId: string;
  startMin: number;
  endMin: number;
  status: "draft" | "published";
}

export async function myShifts(staffId: string): Promise<{
  staffName: string;
  orgName: string;
  roles: RoleDef[];
  shifts: MyShift[];
}> {
  const staff = getStaff(DEMO_ORG_ID).find((s) => s.id === staffId);
  const org = getOrg(DEMO_ORG_ID);
  const slots = slotsForStaff(DEMO_ORG_ID, staffId, true);
  const schedule = getSchedule(DEMO_ORG_ID, periodDates()[0]);
  return {
    staffName: staff?.name ?? "Unknown",
    orgName: org.name,
    roles: getRoles(DEMO_ORG_ID),
    shifts: slots.map((s) => ({
      date: s.date,
      roleId: s.roleId,
      startMin: s.range.start,
      endMin: s.range.end,
      status: schedule?.status ?? "draft",
    })),
  };
}
