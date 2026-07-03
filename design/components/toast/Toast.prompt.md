Toast — brief confirmation after publishing, saving, or an action failing. Bottom-corner or top-of-screen, auto-dismiss ~4s.

```jsx
<Toast tone="success" message="Schedule published to 12 staff" />
<Toast tone="error" message="Couldn't save — check the conflict on Friday" />
```

Tones: success (published/saved), warning (heads up, non-blocking), error (failed action), neutral (informational). Solid fill, not tinted — toasts sit over content so they need full contrast.
