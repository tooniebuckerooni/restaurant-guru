"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  assignSlot,
  eligibleForSlot,
  generateDraft,
  publishSchedule,
  type BoardState,
  type EligibleOption,
} from "@/app/actions";
import { summarize } from "@/lib/engine/generate";
import type { Slot } from "@/lib/engine/types";
import { dollars, formatDay, formatElapsed, formatTime } from "@/lib/format";

const roleColor = (colorKey: string) => ({
  background: `var(--role-${colorKey}-tint)`,
  borderLeft: `4px solid var(--role-${colorKey})`,
});

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="rounded-[var(--radius-md)] border px-4 py-3 min-w-32"
      style={{ background: "var(--surface-card)", borderColor: "var(--border-default)" }}
    >
      <div className="text-[12px] font-semibold tracking-[0.02em] uppercase" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </div>
      <div className="tabular text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      {sub && (
        <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function AssignPicker({
  options,
  currentStaffId,
  onPick,
  onClose,
}: {
  options: EligibleOption[];
  currentStaffId: string | null;
  onPick: (staffId: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center no-print" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "var(--surface-overlay)" }} />
      <div
        className="relative z-50 w-80 rounded-[var(--radius-lg)] p-4"
        style={{ background: "var(--surface-card)", boxShadow: "var(--shadow-lg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-bold mb-2">Assign shift</div>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {options.map((o) => {
            const blocked = o.blockedReason !== null;
            const isCurrent = o.staffId === currentStaffId;
            return (
              <button
                key={o.staffId}
                disabled={blocked || isCurrent}
                onClick={() => onPick(o.staffId)}
                className="w-full text-left rounded-[var(--radius-sm)] px-3 py-2 text-[13px] cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background: isCurrent ? "var(--brand-primary-tint)" : "var(--surface-sunken)",
                  opacity: blocked ? 0.55 : 1,
                }}
              >
                <span className="font-semibold">{o.name}</span>
                <span className="tabular" style={{ color: "var(--text-secondary)" }}>
                  {" "}
                  · {o.currentHours}h
                </span>
                {isCurrent && <span style={{ color: "var(--text-secondary)" }}> · current</span>}
                {blocked && (
                  <div style={{ color: "var(--error-500)" }}>{o.blockedReason}</div>
                )}
              </button>
            );
          })}
        </div>
        {currentStaffId !== null && (
          <button
            onClick={() => onPick(null)}
            className="mt-2 w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] font-semibold cursor-pointer"
            style={{ borderColor: "var(--error-500)", color: "var(--error-500)", background: "transparent" }}
          >
            Unassign — leave shift open
          </button>
        )}
      </div>
    </div>
  );
}

export default function Board({ initial }: { initial: BoardState }) {
  const [board, setBoard] = useState(initial);
  const [toast, setToast] = useState<string | null>(null);
  const [picker, setPicker] = useState<{ slot: Slot; options: EligibleOption[] } | null>(null);
  const [pending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const summary = useMemo(
    () =>
      board.slots.length > 0
        ? summarize(board.staff, board.dates, board.slots, board.org.budgetCents)
        : null,
    [board],
  );

  const generate = () =>
    startTransition(async () => {
      const next = await generateDraft();
      setBoard(next);
      showToast(`Schedule generated in ${formatElapsed(next.schedule?.generatedMs ?? 0)}`);
    });

  const openPicker = (slot: Slot) =>
    startTransition(async () => {
      setPicker({ slot, options: await eligibleForSlot(slot.id) });
    });

  const pick = (staffId: string | null) => {
    const slot = picker!.slot;
    setPicker(null);
    startTransition(async () => {
      const res = await assignSlot(slot.id, staffId);
      if (!res.ok) {
        showToast(`Can't assign: ${res.error}`);
        return;
      }
      setBoard({
        ...board,
        slots: board.slots.map((s) => (s.id === slot.id ? { ...s, staffId } : s)),
        schedule: board.schedule && { ...board.schedule, status: "draft" },
      });
    });
  };

  const publish = () =>
    startTransition(async () => {
      const res = await publishSchedule();
      if (res.ok && board.schedule) {
        setBoard({ ...board, schedule: { ...board.schedule, status: "published" } });
        showToast(`Published — ${board.staff.length} staff notified`);
      }
    });

  const slotsFor = (date: string): Slot[] =>
    board.slots
      .filter((s) => s.date === date)
      .sort((a, b) => a.range.start - b.range.start || a.roleId.localeCompare(b.roleId));

  const roleOf = (id: string) => board.roles.find((r) => r.id === id)!;
  const staffOf = (id: string | null) => board.staff.find((s) => s.id === id);
  const periodLabel = `${formatDay(board.dates[0]).date} – ${formatDay(board.dates[board.dates.length - 1]).date}`;
  const published = board.schedule?.status === "published";

  return (
    <main className="p-6 max-w-[1400px] mx-auto w-full">
      <header className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            Free &amp; Fast
          </div>
          <div style={{ color: "var(--text-secondary)" }}>
            {board.org.name} · Week of {periodLabel}
            {board.schedule && (
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-[12px] font-semibold"
                style={{
                  background: published ? "var(--success-100)" : "var(--draft-100)",
                  color: published ? "var(--success-700)" : "var(--draft-700)",
                }}
              >
                {published ? "Published" : "Draft"}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="rounded-[var(--radius-sm)] border px-4 py-2 font-semibold cursor-pointer"
            style={{ background: "var(--surface-card)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
          >
            Print / PDF
          </button>
          {board.slots.length > 0 && !published && (
            <button
              onClick={publish}
              disabled={pending}
              className="rounded-[var(--radius-sm)] border px-4 py-2 font-semibold cursor-pointer"
              style={{ background: "var(--surface-card)", borderColor: "var(--success-500)", color: "var(--success-700)" }}
            >
              Publish
            </button>
          )}
          <button
            onClick={generate}
            disabled={pending}
            className="rounded-[var(--radius-sm)] px-4 py-2 font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
          >
            {board.slots.length > 0 ? "Regenerate" : "Generate schedule"}
          </button>
        </div>
      </header>

      {summary && (
        <div className="flex gap-3 mb-5 flex-wrap">
          <StatTile label="Total hours" value={`${summary.totalHours} hrs`} />
          <StatTile
            label="Labor cost"
            value={dollars(summary.totalCostCents)}
            sub={board.org.budgetCents ? `budget ${dollars(board.org.budgetCents)}` : undefined}
          />
          <StatTile label="Open shifts" value={String(summary.openSlotCount)} />
          <StatTile label="Warnings" value={String(summary.warnings.length)} />
        </div>
      )}

      {summary && summary.warnings.length > 0 && (
        <div
          className="rounded-[var(--radius-md)] border px-4 py-2 mb-5 text-[13px] no-print"
          style={{ background: "var(--warning-100)", borderColor: "var(--warning-500)", color: "var(--warning-700)" }}
        >
          {summary.warnings.slice(0, 4).map((w, i) => (
            <div key={i}>{w.message}</div>
          ))}
          {summary.warnings.length > 4 && <div>…and {summary.warnings.length - 4} more</div>}
        </div>
      )}

      {board.slots.length > 0 ? (
        <div
          className="grid gap-px rounded-[var(--radius-lg)] border overflow-hidden print-clean"
          style={{
            gridTemplateColumns: `repeat(${board.dates.length}, minmax(0, 1fr))`,
            background: "var(--border-default)",
            borderColor: "var(--border-default)",
          }}
        >
          {board.dates.map((date) => {
            const day = formatDay(date);
            return (
              <div key={`h-${date}`} className="px-2 py-2 text-center" style={{ background: "var(--surface-sunken)" }}>
                <div className="font-bold">{day.name}</div>
                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {day.date}
                </div>
              </div>
            );
          })}
          {board.dates.map((date) => (
            <div key={date} className="p-1.5 space-y-1.5 min-h-56" style={{ background: "var(--surface-card)" }}>
              {slotsFor(date).map((slot) => {
                const role = roleOf(slot.roleId);
                const open = slot.staffId === null;
                return (
                  <button
                    key={slot.id}
                    onClick={() => openPicker(slot)}
                    className="block w-full text-left rounded-[var(--radius-sm)] px-2 py-1 text-[13px] leading-snug cursor-pointer"
                    style={
                      open
                        ? { background: "var(--error-100)", borderLeft: "4px solid var(--error-500)" }
                        : roleColor(role.colorKey)
                    }
                    title="Click to reassign"
                  >
                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {open ? "Open shift" : staffOf(slot.staffId)?.name}
                    </div>
                    <div className="tabular" style={{ color: "var(--text-secondary)" }}>
                      {role.name} · {formatTime(slot.range.start)}–{formatTime(slot.range.end)}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-[var(--radius-lg)] border border-dashed p-16 text-center"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
        >
          <div className="text-[18px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Next week is ready to build
          </div>
          <div>
            {board.staff.length} staff · standard week template · one click
          </div>
        </div>
      )}

      {summary && (
        <section className="mt-6">
          <h2 className="text-[16px] font-bold mb-2">Hours this week</h2>
          <div className="grid gap-1 max-w-xl">
            {summary.totalsByStaff
              .filter((t) => t.shiftCount > 0)
              .sort((a, b) => b.hours - a.hours)
              .map((t) => {
                const s = staffOf(t.staffId)!;
                const pct = Math.min(100, (t.hours / s.targetHoursPerWeek) * 100);
                const over = t.hours > s.targetHoursPerWeek;
                return (
                  <div key={t.staffId} className="flex items-center gap-3 text-[13px]">
                    <div className="w-20 shrink-0">{s.name}</div>
                    <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background: "var(--surface-sunken)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: over ? "var(--warning-500)" : "var(--brand-primary)" }}
                      />
                    </div>
                    <div className="tabular w-24 text-right" style={{ color: "var(--text-secondary)" }}>
                      {t.hours}h / {s.targetHoursPerWeek}h
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      <footer className="mt-8 text-[12px] no-print" style={{ color: "var(--text-tertiary)" }}>
        Demo: view as staff —{" "}
        {board.staff.slice(0, 4).map((s, i) => (
          <span key={s.id}>
            {i > 0 && " · "}
            <Link href={`/me/${s.id}`} className="underline">
              {s.name}
            </Link>
          </span>
        ))}
      </footer>

      {picker && (
        <AssignPicker
          options={picker.options}
          currentStaffId={picker.slot.staffId}
          onPick={pick}
          onClose={() => setPicker(null)}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-[var(--radius-md)] px-4 py-2 font-semibold no-print"
          style={{ background: "var(--neutral-900)", color: "var(--neutral-0)", boxShadow: "var(--shadow-lg)" }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}
