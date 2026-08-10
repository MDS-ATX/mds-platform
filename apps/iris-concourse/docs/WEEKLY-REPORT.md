# Weekly Traffic Report — automation

The report at `/reports/iris-concourse` covers a fixed **Mon–Sun** week and is
generated **once a week** by a GitHub Action, then served instantly from a
committed snapshot.

## How it works

1. **Monday ~00:00 Central**, the GitHub Action (`.github/workflows/weekly-report.yml`)
   runs. It builds the app, starts it locally, and:
   - Calls `/api/admin/report-data`, which does the slow FUB + Google-Sheet pull
     for **the week that just ended** (the window auto-resolves to the prior
     Sunday — see `resolveWeekOf`). This takes ~2 min, which is fine in CI.
   - Writes the result to `src/data/report-snapshot.json`.
   - Renders the report page to **`report.pdf`** (Puppeteer) and **emails it**
     (Resend) to the recipients.
   - Commits the snapshot back to the repo.
2. The commit **triggers a Vercel deploy**. The deployed report page reads the
   committed snapshot, so it loads in well under a second and shows the **same
   numbers all week** — it never does the heavy pull at request time (which
   would exceed Vercel's function timeout).

So: the heavy work runs weekly in GitHub Actions (no timeout); Vercel only ever
serves the snapshot.

## One-time setup

### GitHub repo secrets (Settings → Secrets and variables → Actions)
- `FUB_API_KEY`
- `ADMIN_PASSWORD`
- `CONTRACTS_SHEET_ID` = `1k-8Jm1rKgmnjc0SMfXkpSKFikuXZ3Dl0_WZ2PjEcCjY`
- `CONTRACTS_SHEET_GID` = `579615243`
- `RESEND_API_KEY` — from resend.com (free tier is fine)
- `REPORT_RECIPIENTS` — comma-separated emails (e.g. the developer + team)
- `REPORT_FROM` — a sender on a domain you've verified in Resend

### Vercel project env vars
Set the same FUB / admin / sheet vars (`FUB_API_KEY`, `ADMIN_PASSWORD`,
`CONTRACTS_SHEET_ID`, `CONTRACTS_SHEET_GID`, plus the existing
`NEXT_PUBLIC_*`). The page reads the snapshot, but the middleware (login) and the
live fallback still need them.

### Email sender
Resend requires a verified domain for `REPORT_FROM`. If you don't have one yet,
use Resend's onboarding/test sender to start, then switch to your domain.

## Running it manually

- From the **Actions tab** → "Weekly Report" → **Run workflow**.
- Locally:
  ```bash
  pnpm dev                     # or pnpm build && pnpm start
  pnpm report:refresh          # writes src/data/report-snapshot.json
  pnpm report:pdf              # writes report.pdf + emails (if Resend env set)
  ```
  (`report:pdf` needs `pnpm install` to have pulled in puppeteer.)

## Changing the week
The window is automatic (prior Mon–Sun). To force a specific week for testing,
set `"weekOf": "YYYY-MM-DD"` (the ending Sunday) in `src/data/report-inputs.json`
instead of `"auto"`.

## Closed / hold counts
Offers + under-contract come live from the team-log **CC Contracts** tab. Closed
and On-Hold counts still come from `report-inputs.json` until those statuses live
in the sheet too.
