ShiftBlock — the atomic unit of the weekly schedule grid; one per assigned or open shift.

```jsx
<ShiftBlock name="Maya R." role="bartender" time="5:00 PM – 11:00 PM" status="default" />
<ShiftBlock role="server" time="11:00 AM – 4:00 PM" status="open" />
<ShiftBlock name="Theo K." role="kitchen" time="4:00 PM – 10:00 PM" status="conflict" />
<ShiftBlock name="Ava P." role="host" time="6:00 PM – 12:00 AM" status="pending-swap" />
```

Left border + tint always carry the role color. `status="conflict"` and `status="pending-swap"` overlay a small floating badge and swap the border/tint to the status color so problems jump out over 30+ blocks. `status="open"` renders a dashed neutral placeholder with no name — the manager taps it to assign someone. Role colors and status colors are drawn from separate token families so they never collide visually.
