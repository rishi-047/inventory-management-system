# Web Prototype Intake

This folder contains the useful parts of the Stitch export for the inventory system web version.

## Kept screens

- `stitch-screens/login.html`
- `stitch-screens/dashboard.html`
- `stitch-screens/inventory.html`
- `stitch-screens/add-item.html`
- `stitch-screens/transactions.html`
- `stitch-screens/alerts.html`

## Excluded from the project copy

- Export screenshots (`screen.png`) because the HTML is the actual source we can build from.
- Decorative/extra navigation ideas such as reports, logs, and help as standalone requirements. They still appear inside some Stitch layouts, but they are not part of the core project scope.

## Why these were kept

They map cleanly to the features already present in the C++ console app:

- login with roles
- dashboard metrics
- inventory list
- add product flow
- sell product flow
- low-stock warning panel

## Recommended next step

Convert these raw screens into a single connected static app or React app with:

- shared sidebar/topbar
- one central design token file
- mock product data in JavaScript
- role-based screen states for Admin and Cashier
- forms connected to local state or browser storage
