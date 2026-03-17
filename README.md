# UPI QR Studio — v2

A modern, dark-mode React app for generating UPI payment QR labels.

## What's new in v2
- Dark mode first UI with `Outfit` typeface
- 3-step wizard: Payment → Branding → Design
- 8 one-click colour presets + manual colour pickers
- Dot-grid preview canvas with live dot indicator
- Inline UPI string preview with validation
- Logo drag-and-drop zone
- Expand / fit preview toggle
- All export options: PNG (3×), JPG, Print, Share link

## Quick start

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Deploy

```bash
npm run build        # /dist
npx vercel           # one command
# or drag /dist → netlify.com/drop
```

## Structure

```
src/
├── App.jsx                     # Everything — wizard, steps, layout
├── components/
│   └── QRLabel.jsx             # Rendered label (also used by html2canvas)
├── hooks/
│   └── useGeneratorState.js    # State + URL param restore
└── utils/
    ├── upi.js                  # UPI string, share encode/decode
    └── export.js               # PNG / JPG / Print
```

## License
MIT
