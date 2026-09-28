# Development guide

## Prerequisites

Node.js 20 or later.

## Commands

```bash
npm ci
npm test
npm run build
npm start
```

Open `http://localhost:3000` after starting the server.

## Delivery workflow

1. Create a feature branch.
2. Run tests and build locally.
3. Open a pull request; CI must pass.
4. Merge into `main`; the deployment workflow publishes GitHub Pages.

## GitHub setup

In **Settings → Pages**, set the source to **GitHub Actions**. In **Settings → Branches**, add a protection rule for `main` and require the `Continuous Integration / verify` status check before merging.
