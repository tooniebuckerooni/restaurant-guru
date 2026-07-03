"use client";

import { useMemo, useState } from "react";
import { generateSchedule } from "@/lib/engine/generate";
import type { GenerationResult, Slot } from "@/lib/engine/types";
import { demoInput, demoRoles, demoStaff, nextPeriodDates } from "@/lib/demo";

function formatTime(minutes: number): string {
  const m = minutes % (24 * 60);
  const hr = Math.floor(m / 60);
  const min = m % 60;
  const ampm = hr < 12 ? "AM" : "PM";
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return min === 0 ? `${h12} ${ampm}` : `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

function formatDay(iso: string): { name: string; date: string } {
  const d = new Date(`${iso}T00:00:00`);
  return {
    name: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function dollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

const roleColor = (colorKey: string) => ({
  background: `var(--role-${colorKey}-tint)`,
  borderLeft: `4px solid var(--role-${colorKey})`,
});

function ShiftBlock({ slot }: { slot: Slot }) {
  const role = demoRoles.find((r) => r.id === slot.roleId)!;
  const open = slot.staffId === null;
  const staff = open ? null : demoStaff.find((s) => s.id === slot.staffId);
  return (
    <div
      className="rounded-[var(--radius-sm)] px-2 py-1 text-[13px] leading-snug"
      style={
        open
          ? {
              background: "var(--error-100)",
              borderLeft: "4px solid var(--error-500)",
            }
          : roleColor(role.colorKey)
      }
    >
      <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
        {open ? "Open shift" : staff!.name}
      </div>
      <div className="tabular" style={{ color: "var(--text-secondary)" }}>
        {role.name} · {formatTime(slot.range.start)}–{formatTime(slot.range.end)}
      </div>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="rounded-[var(--radius-md)] border px-4 py-3 min-w-32"
      style={{ background: "var(--surface-card)", borderColor: "var(--border-default)" }}
    >
      <div
        className="text-[12px] font-semibold tracking-[0.02em] uppercase"
        style={{ color: "var(--text-tertiary)" }}
      >
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

export default function SchedulePage() {
  const dates = useMemo(() => nextPeriodDates(), []);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const generate = () => {
    const r = generateSchedule(demoInput(dates));
    setResult(r);
    setToast(
      r.elapsedMs < 1000
        ? `Schedule generated in ${Math.max(1, Math.round(r.elapsedMs))} ms`
        : `Schedule generated in ${(r.elapsedMs / 1000).toFixed(1)}s`,
    );
    setTimeout(() => setToast(null), 4000);
  };

  const slotsFor = (date: string): Slot[] =>
    (result?.slots ?? [])
      .filter((s) => s.date === date)
      .sort((a, b) => a.range.start - b.range.start || a.roleId.localeCompare(b.roleId));

  const periodLabel = `${formatDay(dates[0]).date} – ${formatDay(dates[dates.length - 1]).date}`;

  return (
    <main className="p-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            Free &amp; Fast
          </div>
          <div style={{ color: "var(--text-secondary)" }}>
            The Amber Room · Week of {periodLabel}
          </div>
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="rounded-[var(--radius-sm)] border px-4 py-2 font-semibold cursor-pointer"
            style={{
              background: "var(--surface-card)",
              borderColor: "var(--border-strong)",
              color: "var(--text-primary)",
            }}
          >
            Print / PDF
          </button>
          <button
            onClick={generate}
            className="rounded-[var(--radius-sm)] px-4 py-2 font-semibold cursor-pointer"
            style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
          >
            {result ? "Regenerate" : "Generate schedule"}
          </button>
        </div>
      </header>

      {/* Stats */}
      {result && (
        <div className="flex gap-3 mb-5 flex-wrap">
          <StatTile label="Total hours" value={`${result.totalHours} hrs`} />
          <StatTile label="Labor cost" value={dollars(result.totalCostCents)} sub="budget $5,000" />
          <StatTile label="Open shifts" value={String(result.openSlotCount)} />
          <StatTile label="Warnings" value={String(result.warnings.length)} />
        </div>
      )}

      {/* Warnings strip */}
      {result && result.warnings.length > 0 && (
        <div
          className="rounded-[var(--radius-md)] border px-4 py-2 mb-5 text-[13px] no-print"
          style={{ background: "var(--warning-100)", borderColor: "var(--warning-500)", color: "var(--warning-700)" }}
        >
          {result.warnings.slice(0, 4).map((w, i) => (
            <div key={i}>{w.message}</div>
          ))}
          {result.warnings.length > 4 && <div>…and {result.warnings.length - 4} more</div>}
        </div>
      )}

      {/* Grid */}
      {result ? (
        <div
          className="grid gap-px rounded-[var(--radius-lg)] border overflow-hidden print-clean"
          style={{
            gridTemplateColumns: `repeat(${dates.length}, minmax(0, 1fr))`,
            background: "var(--border-default)",
            borderColor: "var(--border-default)",
          }}
        >
          {dates.map((date) => {
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
          {dates.map((date) => (
            <div key={date} className="p-1.5 space-y-1.5 min-h-56" style={{ background: "var(--surface-card)" }}>
              {slotsFor(date).map((slot) => (
                <ShiftBlock key={slot.id} slot={slot} />
              ))}
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
          <div>8 staff · standard week template · one click</div>
        </div>
      )}

      {/* Hours per person */}
      {result && (
        <section className="mt-6">
          <h2 className="text-[16px] font-bold mb-2">Hours this week</h2>
          <div className="grid gap-1 max-w-xl">
            {result.totalsByStaff
              .filter((t) => t.shiftCount > 0)
              .sort((a, b) => b.hours - a.hours)
              .map((t) => {
                const s = demoStaff.find((st) => st.id === t.staffId)!;
                const pct = Math.min(100, (t.hours / s.targetHoursPerWeek) * 100);
                const over = t.hours > s.targetHoursPerWeek;
                return (
                  <div key={t.staffId} className="flex items-center gap-3 text-[13px]">
                    <div className="w-20 shrink-0">{s.name}</div>
                    <div
                      className="h-2 flex-1 rounded-full overflow-hidden"
                      style={{ background: "var(--surface-sunken)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: over ? "var(--warning-500)" : "var(--brand-primary)",
                        }}
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

      {/* Toast */}
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
