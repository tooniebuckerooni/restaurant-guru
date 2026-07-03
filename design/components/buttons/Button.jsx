import React from 'react';

const SIZE = {
  md: { padding: '0 16px', height: 38, fontSize: 14 },
  sm: { padding: '0 12px', height: 32, fontSize: 13 },
};

export function Button({ variant = 'primary', size = 'md', disabled = false, icon = null, children, onClick }) {
  const s = SIZE[size] || SIZE.md;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: s.height,
    padding: s.padding,
    fontFamily: 'var(--font-body)',
    fontSize: s.fontSize,
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
    whiteSpace: 'nowrap',
  };

  const variants = {
    primary: {
      background: 'var(--brand-primary)',
      color: 'var(--text-on-brand)',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-strong)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
    },
    danger: {
      background: 'var(--error-500)',
      color: '#fff',
    },
  };

  return React.createElement(
    'button',
    {
      style: { ...base, ...variants[variant] },
      disabled,
      onClick,
      onMouseEnter: (e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--brand-primary-hover)';
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--surface-sunken)';
        if (variant === 'ghost') e.currentTarget.style.background = 'var(--surface-sunken)';
        if (variant === 'danger') e.currentTarget.style.background = 'var(--error-700)';
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.background = variants[variant].background;
      },
      onMouseDown: (e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; },
      onMouseUp: (e) => { e.currentTarget.style.transform = 'scale(1)'; },
    },
    icon,
    children
  );
}
