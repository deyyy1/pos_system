# Tindahan POS — Sari-Sari Store POS & Inventory System

A React + Vite web app for a small Philippine sari-sari store, built to later
ship as an Android app via Capacitor.

## Status (first build)

**Implemented (Priority 1–4 from the brief):**
- Navigation: sidebar (desktop) / bottom nav (mobile), 8 sections
- Dashboard: today's sales/cash/GCash/load totals, Utang outstanding, Cash Vault, GCash fees, profit estimate, low/out-of-stock/expiring alerts, quick actions, recent transactions feed
- POS: search by name/barcode, category tabs, cart with qty controls, discount, Cash (with change) or GCash checkout, inventory deduction, printable receipt
- Inventory: add/edit/delete products (name, SKU, barcode, category, unit, cost, price, wholesale price, bulk flag, stock, low-stock reminder, expiration date), Stock-In flow tied to suppliers, Stock Batches view, stock history log, cost/retail/profit value cards, expiring-soon tracking
- Load: quick-sell by denomination *and* a full Cash-In/Cash-Out transaction form (network, service fee with auto-fill fee table, fee-paid-via, customer name, reference number), opening-balance editor, kept separate from product sales
- GCash: Cash-In / Cash-Out with an editable, auto-filling service-fee table (by amount bracket), fee-paid-via (cash or GCash balance), customer name / reference number, opening-balance editor, GCash balance vs cash balance kept separate, GCash *payments* (from POS) are tracked as their own sale method
- Cash Vault: move cash from the drawer into a separate reserve (and back), with its own history — for savings or restocking funds you don't want mixed into daily cash on hand
- Utang (customer credit): per-customer ledger, due dates ("kailan babayaran"), overdue tracking, log payments
- Transactions: unified history (sales, load, GCash), filters by date range / type / method, detail view, void (restores stock/cash), reprint
- Reports: revenue, COGS, expenses, net profit, sales by day, best-selling / most-profitable / slow-moving products, payment-method split, load profit, GCash fees, inventory value, balances snapshot
- Expenses: categorized expense log feeding net profit
- Suppliers: basic directory, linked to Stock-In

**Not yet built (Priority 5 — flagged in the app's Settings tab too):**
- PIN login / Owner vs Cashier roles / audit log
- True offline sync (currently: local-only via `localStorage`, no online/offline indicator or background sync)
- Camera barcode scanning (a barcode *field* exists on products and is searchable, but there's no scanner UI yet)
- Thermal printer integration (currently uses the browser's native print dialog)
- Capacitor Android build itself (config file is in place; `npx cap add android` hasn't been run)
- PDF/Excel export on Reports

## Project structure

```
src/
  main.jsx, App.jsx        — entry point, router
  index.css                 — all styling (CSS variables, responsive nav)
  constants.js               — categories, networks, denominations
  store/useStore.js         — single Zustand store: ALL domain state + actions
                               (products, sales, load, gcash, expenses, suppliers)
                               persisted to localStorage via zustand/middleware persist
  services/dataService.js   — seed data + notes on swapping in a real backend
  components/               — Layout (nav), Modal, StatCard
  pages/                     — Dashboard, POS, Inventory, Load, GCash,
                               Transactions, Reports, More (Expenses/Suppliers/Settings)
```

**Why this shape:** every page reads/writes through `useStore` only — no page talks
to `localStorage` or a future API directly. That means connecting a real backend
later is a one-file change: rewrite the actions inside `useStore.js` (e.g.
`checkout`, `sellLoad`, `gcashService`) to call your API instead of mutating
local state, keeping the same function signatures.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
```

## Turning this into an Android app later (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init        # appId/appName already suggested in capacitor.config.json
npm run build
npx cap add android
npx cap sync
npx cap open android   # opens Android Studio
```

No browser-only APIs are used outside of `localStorage`/`window.print`, both of
which Capacitor's WebView supports, so this shouldn't block the Android wrap.

## Next suggested steps (in priority order)

1. PIN login + Owner/Cashier roles (gate Inventory edits, void, and Reports behind Owner)
2. Real offline queue + online/offline indicator (today's `localStorage` persistence is offline-*capable* but not sync-aware)
3. Camera barcode scanning in POS (e.g. via a barcode-scanning library once wrapped in Capacitor)
4. Swap `useStore.js` internals for a real API/database
5. Thermal printer + PDF/Excel export
