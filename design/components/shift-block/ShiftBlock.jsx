import React from 'react';

const ROLE_VARS = {
  bartender: ['--role-bartender', '--role-bartender-tint'],
  server: ['--role-server', '--role-server-tint'],
  kitchen: ['--role-kitchen', '--role-kitchen-tint'],
  host: ['--role-host', '--role-host-tint'],
  barback: ['--role-barback', '--role-barback-tint'],
  manager: ['--role-manager', '--role-manager-tint'],
  driver: ['--role-driver', '--role-driver-tint'],
  cleaner: ['--role-cleaner', '--role-cleaner-tint'],
};

/**
 * A single shift block as it appears in the weekly grid.
 * status: 'default' | 'conflict' | 'open' | 'pending-swap'
 */
export function ShiftBlock({ name, role = 'server', time, status = 'default', onClick }) {
  const [roleColor, roleTint] = ROLE_VARS[role] || ROLE_VARS.server;

  let border, background, dashed = false, badge = null;
  if (status === 'conflict') {
    border = `1.5px solid var(--error-500)`;
    background = 'var(--error-100)';
    badge = { label: 'Conflict', bg: 'var(--error-500)', fg: '#fff' };
  } else if (status === 'open') {
    border = `1.5px dashed var(--neutral-300)`;
    background = 'var(--surface-sunken)';
    dashed = true;
  } else if (status === 'pending-swap') {
    border = `1.5px solid var(--warning-500)`;
    background = 'var(--warning-100)';
    badge = { label: 'Swap pending', bg: 'var(--warning-500)', fg: '#fff' };
  } else {
    border = `1px solid var(--border-default)`;
    background = `var(${roleTint})`;
  }

  return React.createElement(
    'div',
    {
      onClick,
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '8px 10px',
        borderRadius: 'var(--radius-sm)',
        border,
        background,
        borderLeft: status === 'default' ? `4px solid var(${roleColor})` : (border.includes('dashed') ? border : `4px solid ${status === 'conflict' ? 'var(--error-500)' : status === 'pending-swap' ? 'var(--warning-500)' : `var(${roleColor})`}`),
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
        minWidth: 132,
        opacity: dashed ? 0.9 : 1,
        color: dashed ? 'var(--text-tertiary)' : 'var(--text-primary)',
        transition: 'box-shadow var(--duration-fast) var(--ease-standard)',
      },
    },
    dashed
      ? React.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, 'Open shift')
      : React.createElement('div', { style: { fontSize: 13, fontWeight: 700, lineHeight: 1.2 } }, name),
    !dashed && React.createElement('div', { style: { fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'capitalize' } }, role),
    React.createElement('div', {
      style: {
        fontSize: 11.5,
        fontWeight: 600,
        color: dashed ? 'var(--text-tertiary)' : 'var(--text-secondary)',
        fontFeatureSettings: "'tnum' 1",
      },
    }, time),
    badge && React.createElement('span', {
      style: {
        position: 'absolute', top: -7, right: 8,
        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
        background: badge.bg, color: badge.fg, letterSpacing: '0.02em',
      },
    }, badge.label)
  );
}
