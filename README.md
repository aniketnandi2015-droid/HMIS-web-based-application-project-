# HMIS pharmacy operations

HMIS is a web-based pharmacy inventory product that helps local pharmacies see stock risk, act on expiry dates, and prepare replenishment decisions.

## What is included

- A responsive inventory dashboard prototype.
- Inventory rule tests for replenishment and expiry risk.
- A production build that produces `dist/`.
- GitHub Actions CI and GitHub Pages deployment workflows.
- Product, architecture, and development documentation in [`docs/`](docs/).

## Start locally

```bash
npm ci
npm start
```

Visit `http://localhost:3000`. Run `npm test` to verify the inventory rules and `npm run build` to generate the production files.

## CI/CD

Every pull request and push to `main` runs tests and a production build. A push to `main` also deploys the built application through GitHub Pages. Enable **Settings → Pages → Source → GitHub Actions** once the changes are pushed.

See [`docs/development.md`](docs/development.md) for the release workflow and [`docs/architecture.md`](docs/architecture.md) for the implementation boundaries.
