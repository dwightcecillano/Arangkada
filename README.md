# Arangkada: dealer network console (demo)

A working, browser-only demo of a modern system for a multi-branch motorcycle dealership network: point of sale, inventory across branches, captive financing, LTO registration tracking, and an offline-first sync engine between branches and HQ.

Everything runs in the browser. There is no server or database: the six branches and HQ are simulated in memory, so the demo works anywhere a static site can be hosted, including GitHub Pages.

## What's in the demo

- **Showroom**: sell any unit on your branch's floor (cash or installment), even while the branch is offline. Browse stock across the whole network, place holds, release units for transfer, and receive them.
- **Financing**: take a credit application, preview the amortization schedule, and let HQ score it. Offline branches queue applications until they reconnect.
- **Registration**: an LTO file opens automatically when a sale reaches HQ. Advance it from invoice to plate release.
- **Network**: switch branches online and offline, publish promo prices, resend a batch to prove HQ ignores duplicates, and run the scripted double-sell test.
- **Quick commands**: press `Ctrl K` (or `Cmd K`, or `/`) to jump anywhere, switch branches, or run actions.

Prices and financing rates are illustrative. The data resets when the page reloads, and "Reset demo" in the footer restores the opening state at any time.

## Five-minute presentation script

1. **Home**: cycle the featured models with the 1–8 index or the ← → keys. Point out the live network map in "How a sale moves".
2. **Showroom**: pick a unit, choose installment, adjust the downpayment and term, and record the sale. Watch the Outbox counter in the nav rise and drain.
3. **Toggle your branch offline** (the Online pill in the nav) and sell again. The sale still works; HQ catches up when you reconnect.
4. **Network → Run the double-sell test**: Mandaue goes offline and sells a unit while Makati is blocked from reserving the same one.
5. **Resend last batch**: HQ recognizes every event and applies nothing twice.
6. **Financing** and **Registration**: submit an application and advance an LTO file.

## How the sync design works

- **Single ownership.** Each unit has one custodian branch, and only that branch can change it. That rule is what prevents double-selling, with no conflict resolution needed.
- **Transactional outbox.** Every branch action is saved locally together with an event, then sent to HQ in order when the branch is online.
- **Idempotent HQ inbox.** Events carry a unique, time-ordered ID (UUIDv7 style). HQ records processed IDs, so retries and duplicates are safe.
- **Leases for cross-branch holds.** Reserving another branch's unit needs both branches online and a hold granted through HQ.
- **Versioned price lists.** HQ publishes prices once; each branch pulls the newest version on its next sync.

## Project structure

```
index.html            The app shell and navigation
404.html              Friendly not-found page for GitHub Pages
.nojekyll             Tells GitHub Pages to serve files as-is
assets/
  css/style.css       All styles, with design tokens at the top
  js/app.js           All demo logic: data, sync engine, views, events
  img/favicon.svg     Site icon
README.md
```

To change the look, edit the color and font tokens at the top of `assets/css/style.css`. To change branches, models, or prices, edit the `BR` and `SKUS` lists at the top of `assets/js/app.js`.

## Run it locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publish on GitHub Pages

1. Create a **public** repository on GitHub (for example `arangkada`).
2. Upload everything in this folder to the repository root, keeping the `assets` folder structure, and commit.
3. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose **main** and **/ (root)**, and save.
4. After a minute or two, your site is live at `https://<your-username>.github.io/arangkada/`.

Fonts load from Google Fonts. Everything else is in this repository.
