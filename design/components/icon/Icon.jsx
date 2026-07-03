import React from 'react';

/**
 * Thin wrapper over Lucide (loaded from CDN by the consuming page).
 * Renders an inline SVG icon by name; sizes/colors via CSS.
 */
export function Icon({ name, size = 18, strokeWidth = 2, color = 'currentColor', style = {} }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      ref.current.appendChild(el);
      window.lucide.createIcons({ nameAttr: 'data-lucide', attrs: { width: size, height: size, 'stroke-width': strokeWidth, color } , icons: undefined, root: ref.current });
    }
  }, [name, size, strokeWidth, color]);

  return React.createElement('span', {
    ref,
    style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color, ...style },
  });
}
