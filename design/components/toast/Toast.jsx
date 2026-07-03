import React from 'react';

const TONES = {
  success: { bg: 'var(--success-500)', fg: '#fff' },
  warning: { bg: 'var(--warning-500)', fg: '#1a1200' },
  error: { bg: 'var(--error-500)', fg: '#fff' },
  neutral: { bg: 'var(--neutral-800)', fg: '#fff' },
};

export function Toast({ tone = 'success', message, onDismiss }) {
  const t = TONES[tone] || TONES.neutral;
  return React.createElement('div', {
    style: {
      display: 'inline-flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 'var(--radius-md)',
      background: t.bg, color: t.fg, fontFamily: 'var(--font-body)',
      fontSize: 13.5, fontWeight: 600, boxShadow: 'var(--shadow-lg)',
      minWidth: 260,
    },
  },
    React.createElement('span', { style: { flex: 1 } }, message),
    onDismiss && React.createElement('button', {
      onClick: onDismiss,
      style: { border: 'none', background: 'transparent', color: t.fg, opacity: 0.75, cursor: 'pointer', fontSize: 14 },
    }, '✕')
  );
}
