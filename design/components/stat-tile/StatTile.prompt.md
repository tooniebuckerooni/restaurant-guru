StatTile — top-of-schedule metrics row (total hours, labor cost, open shifts).

```jsx
<StatTile label="Total hours" value="312" delta="+6% vs last wk" />
<StatTile label="Labor cost" value="$4,820" delta="-2%" deltaTone="success" />
<StatTile label="Open shifts" value="3" deltaTone="error" delta="needs coverage" />
```

Value uses the display face at 30px with tabular numerals so digits don't jitter as numbers update live.
