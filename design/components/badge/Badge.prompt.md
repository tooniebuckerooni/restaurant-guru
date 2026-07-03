Badge — small pill for status (published/warning/conflict/draft) or role labeling.

```jsx
<Badge kind="status" tone="success">Published</Badge>
<Badge kind="status" tone="warning">Near overtime</Badge>
<Badge kind="status" tone="error">Double-booked</Badge>
<Badge kind="status" tone="draft">Draft</Badge>
<Badge kind="role" role="bartender">Bartender</Badge>
```

Status tones map 1:1 to the status token family (success/warning/error/draft, plus `brand` for promotional callouts). Role badges pull from the 8 role tokens instead. Always paired with a small dot by default — set `dot={false}` for a plain label chip.
