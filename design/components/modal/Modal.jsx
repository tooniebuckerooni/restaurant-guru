import React from 'react';

export function Modal({ title, children, onClose, footer }) {
  return React.createElement('div', {
    style: {
      position: 'absolute', inset: 0, background: 'var(--surface-overlay)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', zIndex: 10,
    },
  },
    React.createElement('div', {
      style: {
        width: 420, maxWidth: '90%', background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      },
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border-default)' } },
        React.createElement('span', { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' } }, title),
        React.createElement('button', {
          onClick: onClose,
          style: { border: 'none', background: 'transparent', color: 'var(--text-tertiary)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4 },
        }, '✕')
      ),
      React.createElement('div', { style: { padding: 20, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5 } }, children),
      footer && React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border-default)', background: 'var(--surface-sunken)' } }, footer)
    )
  );
}
