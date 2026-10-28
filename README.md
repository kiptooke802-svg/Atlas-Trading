# Atlas Trade — GitHub Pages project

A responsive trading-style dashboard with:
- Public cryptocurrency market prices from CoinGecko's public API (refreshes about once a minute; availability/rate limits depend on provider).
- Interactive TradingView chart embed.
- Searchable market table and browser-stored watchlist.
- Paper-trading orders, demo balance, positions, and order history stored in `localStorage`.

## Publish from an Android phone
1. Download and extract `atlas-trade-github.zip`.
2. Sign in to GitHub and create a **public repository** named `atlas-trade` (or another name).
3. Upload `index.html`, `style.css`, `app.js`, and this `README.md` to the repository root. Do not upload the ZIP as the only file.
4. Open the repository's **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/(root)`, then Save.
6. Wait for GitHub Pages to finish, then open the published URL shown on the Pages screen. It usually looks like `https://YOUR-USERNAME.github.io/atlas-trade/`.

## Important: what is live, and what is not
This project uses real public market-data feeds and an embedded TradingView chart. It is **not a real-money broker**. The order form is paper trading only; it does not send orders to an exchange, accept deposits, or withdraw money. Demo balance and trades are saved only in the current browser and are not shared between users or devices.

For real-money trading, do not simply change the labels or add a deposit form. You need a server-side backend, secure authentication, a database, an approved broker/exchange API, order and balance reconciliation, fraud controls, and legal/regulatory review for the countries you serve. Never put API secret keys in this public repository or browser JavaScript. Use an established licensed broker integration rather than holding customer funds yourself.

## Troubleshooting
- If prices fail to load, try the refresh button later. Free public API endpoints can be rate-limited.
- If the chart is blank, make sure internet access is available and try refreshing. Chart embeds and public market APIs require external services.
- GitHub Pages serves static files only. It does not run a backend or protect private credentials.
