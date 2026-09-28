# Architecture

The initial release is a dependency-free static web application. `public/` contains the browser UI and `scripts/build.mjs` copies it to `dist/`, the deployable artifact. The automated tests validate business rules in `public/app.js`.

GitHub Actions runs CI on every pull request and `main` push. A separate Pages deployment workflow rebuilds the artifact and publishes it after a `main` push. This design is intentionally simple while product requirements are being validated.

When persistent inventory is introduced, put the API and data migrations in separate services, keep secrets only in GitHub Secrets, and change deployment to the selected hosting provider.
