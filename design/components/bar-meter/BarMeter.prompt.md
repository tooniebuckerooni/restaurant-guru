BarMeter — compares scheduled hours per staff member against their weekly target, used in the labor-cost / hours summary panel.

```jsx
<BarMeter name="Maya R." hours={38} target={35} />
<BarMeter name="Theo K." hours={22} target={30} />
```

Fill turns brand-amber under target, warning-amber when hours exceed target (early overtime signal) — deliberately not red; red stays reserved for hard conflicts.
