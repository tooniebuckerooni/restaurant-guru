import React from 'react';

const fieldBase = {
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--text-primary)',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-md)',
  padding: '0 12px',
  height: 40,
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
};

export function Input({ label, placeholder, value, onChange, type = 'text', error }) {
  return React.createElement('label', { style: { display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)' } },
    label && React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' } }, label),
    React.createElement('input', {
      type, placeholder, value, onChange,
      style: { ...fieldBase, borderColor: error ? 'var(--error-500)' : 'var(--border-strong)' },
      onFocus: (e) => { e.currentTarget.style.borderColor = 'var(--brand-500)'; e.currentTarget.style.boxShadow = 'var(--shadow-focus)'; },
      onBlur: (e) => { e.currentTarget.style.borderColor = error ? 'var(--error-500)' : 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none'; },
    }),
    error && React.createElement('span', { style: { fontSize: 12, color: 'var(--error-700)', fontWeight: 500 } }, error)
  );
}

export function Select({ label, value, onChange, options = [] }) {
  return React.createElement('label', { style: { display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)' } },
    label && React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' } }, label),
    React.createElement('select', {
      value, onChange,
      style: { ...fieldBase, appearance: 'none', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%23706a63%27><path d=%27M5 8l5 5 5-5z%27/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: 16, paddingRight: 32 },
      onFocus: (e) => { e.currentTarget.style.borderColor = 'var(--brand-500)'; e.currentTarget.style.boxShadow = 'var(--shadow-focus)'; },
      onBlur: (e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none'; },
    },
      options.map((o) => React.createElement('option', { key: o.value ?? o, value: o.value ?? o }, o.label ?? o))
    )
  );
}
