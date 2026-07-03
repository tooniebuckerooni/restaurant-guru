Button — the primary interactive control across manager and staff surfaces.

```jsx
<Button variant="primary" onClick={publish}>Publish schedule</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="danger">Delete shift</Button>
```

Variants: `primary` (brand-filled, main CTA — one per view), `secondary` (outlined, default action), `ghost` (text-only, toolbar/table-row actions), `danger` (destructive: delete, remove staff). Sizes: `md` (38px, default) and `sm` (32px, dense toolbars/table rows). Pass `disabled` to gray it out; pass `icon` for a leading icon element.
