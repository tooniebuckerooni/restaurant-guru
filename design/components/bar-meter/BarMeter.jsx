import React from 'react';

/** Bar meter comparing scheduled hours per person against a target. */
export function BarMeter({ name, hours, target, unit = 'hrs' }) {
  const pct = Math.min(100, (hours / target) * 100);
  const over = hours > target;
  const barColor = over ? 'var(--warning-500)' : 'var(--brand-500)';
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-body)', minWidth: 220 } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13 } },
      React.createElement('span', { style: { fontWeight: 600, color: 'var(--text-primary)' } }, name),
      React.createElement('span', { style: { fontWeight: 600, color: over ? 'var(--warning-700)' : 'var(--text-secondary)', fontFeatureSettings: "'tnum' 1" } }, `${hours} / ${target} ${unit}`)
    ),
    React.createElement('div', { style: { position: 'relative', height: 8, borderRadius: 'var(--radius-full)', background: 'var(--neutral-200)', overflow: 'hidden' } },
      React.createElement('div', { style: { position: 'absolute', inset: 0, width: `${pct}%`, background: barColor, borderRadius: 'var(--radius-full)', transition: 'width var(--duration-normal) var(--ease-standard)' } })
    )
  );
}
