Icon — inline Lucide icon. Requires the consuming page to load Lucide from CDN once: `<script src="https://unpkg.com/lucide@latest"></script>`.

```jsx
<Button variant="primary" icon={<Icon name="zap" size={16} color="#fff" />}>Generate schedule</Icon>
<Icon name="x" size={16} />          {/* modal/toast dismiss */}
<Icon name="repeat-2" size={16} />   {/* swap shift */}
<Icon name="calendar-days" size={20} /> {/* nav: Shifts */}
```

Free & Fast uses Lucide (stroke icons, 2px default weight) exclusively — no emoji-as-icon, no hand-drawn SVG. `color` defaults to `currentColor` so icons inherit surrounding text color; pass a token value (e.g. `var(--text-secondary)`) explicitly when it needs to differ.
