Modal — centered dialog for shift edits, swap requests, and confirmations. Requires a positioned ancestor (`position: relative`) to contain it.

```jsx
<Modal title="Approve shift swap?" onClose={close}
  footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button variant="primary">Approve</Button></>}>
  Theo K. wants to swap Friday 5–11pm with Ava P.
</Modal>
```

Warm overlay scrim (`--surface-overlay`, a translucent brand-tinted dark), 20px corner radius, header with display-font title + close button, optional footer bar with right-aligned actions.
