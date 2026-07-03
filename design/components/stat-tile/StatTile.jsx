import React from 'react';

/** A compact metric tile, e.g. "Total hours: 312" or "Labor cost: $4,820" */
export function StatTile({ label, value, delta, deltaTone = 'success' }) {
  const deltaColor = deltaTone === 'success' ? 'var(--success-700)' : deltaTone === 'error' ? 'var(--error-700)' : 'var(--text-tertiary)';
  const deltaBg = deltaTone === 'success' ? 'var(--success-100)' : deltaTone === 'error' ? 'var(--error-100)' : 'var(--neutral-100)';
  return React.createElement('div', {
    style: {
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '16px 18px', borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-card)', border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)', fontFamily: 'var(--font-body)', minWidth: 160,
    },
  },
    React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' } }, label),
    React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8 } },
      React.createElement('span', { style: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', fontFeatureSettings: "'tnum' 1" } }, value),
      delta && React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: deltaColor, background: deltaBg, borderRadius: 999, padding: '2px 8px' } }, delta)
    )
  );
}
