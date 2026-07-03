import Link from "next/link";
import { myShifts } from "@/app/actions";
import { formatDayLong, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MyShiftsPage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await params;
  const data = await myShifts(staffId);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.shifts.filter((s) => s.date >= today);
  const next = upcoming[0];
  const roleName = (id: string) => data.roles.find((r) => r.id === id)?.name ?? id;
  const firstName = data.staffName.split(" ")[0];

  return (
    <main className="p-6 max-w-md mx-auto w-full">
      <header className="mb-5">
        <div className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
          Hey {firstName} 👋
        </div>
        <div style={{ color: "var(--text-secondary)" }}>{data.orgName}</div>
      </header>

      {next ? (
        <section
          className="rounded-[var(--radius-xl)] p-5 mb-6"
          style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
        >
          <div className="text-[12px] font-semibold tracking-[0.02em] uppercase opacity-90">
            Next shift
          </div>
          <div className="text-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            {formatDayLong(next.date)}
          </div>
          <div className="tabular text-[16px]">
            {roleName(next.roleId)} · {formatTime(next.startMin)}–{formatTime(next.endMin)}
            {next.status === "draft" && " · draft"}
          </div>
        </section>
      ) : (
        <section
          className="rounded-[var(--radius-xl)] border border-dashed p-8 text-center mb-6"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
        >
          No upcoming shifts yet — the next schedule hasn&apos;t been published.
        </section>
      )}

      {upcoming.length > 1 && (
        <section>
          <h2 className="text-[16px] font-bold mb-2">Coming up</h2>
          <div className="space-y-2">
            {upcoming.slice(1).map((s, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-md)] border px-4 py-3 flex items-center justify-between"
                style={{ background: "var(--surface-card)", borderColor: "var(--border-default)" }}
              >
                <div>
                  <div className="font-semibold">{formatDayLong(s.date)}</div>
                  <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    {roleName(s.roleId)}
                    {s.status === "draft" && " · draft"}
                  </div>
                </div>
                <div className="tabular text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  {formatTime(s.startMin)}–{formatTime(s.endMin)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
        <Link href="/" className="underline">
          ← Manager view (demo)
        </Link>
      </footer>
    </main>
  );
}
