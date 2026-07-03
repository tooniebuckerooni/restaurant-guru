import React from 'react';

const STATUS_TONES = {
  success: { bg: 'var(--success-100)', fg: 'var(--success-700)', dot: 'var(--success-500)' },
  warning: { bg: 'var(--warning-100)', fg: 'var(--warning-700)', dot: 'var(--warning-500)' },
  error: { bg: 'var(--error-100)', fg: 'var(--error-700)', dot: 'var(--error-500)' },
  draft: { bg: 'var(--draft-100)', fg: 'var(--draft-700)', dot: 'var(--draft-500)' },
  brand: { bg: 'var(--brand-primary-tint)', fg: 'var(--brand-700)', dot: 'var(--brand-500)' },
};

const ROLE_TONES = {
  bartender: ['--role-bartender', '--role-bartender-tint'],
  server: ['--role-server', '--role-server-tint'],
  kitchen: ['--role-kitchen', '--role-kitchen-tint'],
  host: ['--role-host', '--role-host-tint'],
  barback: ['--role-barback', '--role-barback-tint'],
  manager: ['--role-manager', '--role-manager-tint'],
  driver: ['--role-driver', '--role-driver-tint'],
  cleaner: ['--role-cleaner', '--role-cleaner-tint'],
};

/** kind: 'status' uses success/warning/error/draft/brand tone; 'role' uses a role color. */
export function Badge({ kind = 'status', tone = 'draft', role, dot = true, children }) {
  let bg, fg, dotColor;
  if (kind === 'role' && ROLE_TONES[role]) {
    const [c, t] = ROLE_TONES[role];
    bg = `var(${t})`; fg = 'var(--text-primary)'; dotColor = `var(${c})`;
  } else {
    const t = STATUS_TONES[tone] || STATUS_TONES.draft;
    bg = t.bg; fg = t.fg; dotColor = t.dot;
  }
  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      background: bg, color: fg,
      fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
      lineHeight: 1.4, whiteSpace: 'nowrap',
    },
  },
    dot && React.createElement('span', { style: { width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 } }),
    children
  );
}
