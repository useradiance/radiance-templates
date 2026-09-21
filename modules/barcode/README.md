# barcode module

Camera barcode / QR scanner using `expo-camera`, plus a `/scan` route.

Install with:

```bash
radiance add barcode
```

**Requires:** `i18n`, `theme`

## What it does

- Requests camera permission and scans QR / EAN / Code128 / UPC.
- Locks after first scan; offers “Scan again”.
- `/scan` route navigates home with a `scanned` param (customize as needed).

## What it adds

| Path                            | Purpose                          |
| ------------------------------- | -------------------------------- |
| `components/BarcodeScanner.tsx` | Embeddable scanner               |
| `components/QrCode.tsx`         | Display a QR (tickets / invites) |
| `app/(app)/scan.tsx`            | Full-screen scan route           |
| `locales/en.json`               | Permission / scan copy           |

## Usage

```tsx
<BarcodeScanner
  onScan={(value, type) => {
    /* lookup SKU / ticket */
  }}
/>
```

Or navigate to `/scan`.

## Setup checklist

1. Development build (camera not fully available in all Expo Go contexts).
2. Plugin permission strings are merged into `app.config` on install.

## Notes

- Handle the scanned value in your domain layer (inventory, tickets, check-in).
