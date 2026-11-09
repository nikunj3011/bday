# Helly’s Wonderland

A birthday wonderland made for Helly, built with React and TypeScript. Explore space cakes, sunny Candyland, and the original 2025 birthday game.

- 2026: choose Cakes or Candyland; pop-and-chase space treats with funny commentary, space-calorie points, a growing birthday avatar, and a birthday finale. Includes light and dark themes.
- 2025: the original birthday game with mobile controls.

## Publish on GitHub Pages

One-time repository setting: open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

Commit the project files (including `package-lock.json` and `.github/workflows/`) and push to `main`. The deployment workflow installs dependencies, type-checks, builds, and publishes `dist/` automatically. Watch progress under the repository’s **Actions** tab. No extra secrets are required.

Expected site: https://nikunj3011.github.io/bday/

- https://nikunj3011.github.io/bday/2025/
- https://nikunj3011.github.io/bday/2026/

The workflow reads the deployment base from GitHub Pages, so assets, audio, year links, and the archived game also work under `/bday/`. Both years have real entry files for direct links and refreshes. Pull requests run a build check without deploying.

## Local development

Use Node.js 22 or later. Run `npm ci`, then `npm run dev`.

Run `npm run build` for a production build and `npm run preview` to preview it. Local builds default to `/`. Set `SITE_BASE_PATH=/bday/` when testing a repository-path deployment. Upload only `dist/` when using another static host.

`src/universe.ts` contains the canvas engine. `public/2025/original.html` contains the 2025 game. `birthday-original.html` is an untouched backup.

Run `npm test` to check cake popping, temporary cursor escapes, scoring, the birthday finale, mobile reachability, and resets. GitHub Actions runs these checks before publishing.

The 2026 Cakes/Candyland switch starts a fresh round. Clear all treats to see Helly sleeping and dreaming of the selected world: cake castles or lollipop trees and floating candies. Dream animations respect reduced-motion settings.
