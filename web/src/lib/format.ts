export function formatTime(minutes: number): string {
  const m = minutes % (24 * 60);
  const hr = Math.floor(m / 60);
  const min = m % 60;
  const ampm = hr < 12 ? "AM" : "PM";
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return min === 0 ? `${h12} ${ampm}` : `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

export function formatDay(iso: string): { name: string; date: string } {
  const d = new Date(`${iso}T00:00:00`);
  return {
    name: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

export function formatDayLong(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function dollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

export function formatElapsed(ms: number): string {
  return ms < 1000 ? `${Math.max(1, Math.round(ms))} ms` : `${(ms / 1000).toFixed(1)}s`;
}
