# Learn

Visual, interactive software engineering lessons. Content as code, deployed to GitHub Pages.

## Local development

Use Node.js 22 (22.12 or later).

```sh
npm install
npm run dev
npm run check
npm run build
npm run preview
```

## Publishing

In repository Settings → Pages, select **GitHub Actions** as the source. The deployment workflow builds and publishes the `main` branch. The project is configured for https://arashrasoulzadeh.github.io/learn/.

## Adding lessons

See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md). Lessons live in `src/content/concepts`, categories in `src/content/categories`, and interactive components in `src/components/learning`. No route edits are required.
