Input & Select — standard form fields for scheduling settings, staff details, and filters.

```jsx
<Input label="Shift name" placeholder="e.g. Weekend brunch" />
<Input label="Hourly rate" type="number" error="Required" />
<Select label="Role" options={['Bartender', 'Server', 'Kitchen', 'Host']} />
```

40px tall, 1px border, brand-colored focus ring (`--shadow-focus`). Pass `error` on Input to show a red border + helper message below.
