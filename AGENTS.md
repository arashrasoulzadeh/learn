# Learn — contributor instructions

- Keep Astro static output compatible with GitHub Pages; no server or database required.
- Add concepts in src/content/concepts/<category>/<slug>.mdx, category metadata in src/content/categories. Do not hardcode lesson routes or navigation.
- Default lesson language: English. Keep prose approachable and technical claims accurate. Distinguish protocol guarantees from common implementation choices.
- Every lesson must contain a motivation, mental model, visual explanation or interactive demo, practical example, pitfalls, knowledge check, takeaway and authoritative references.
- Use accessible controls, labels, keyboard navigation, reduced-motion support and text alternatives. Keep browser storage optional. Avoid collecting user data.
- Use local reusable components; keep third-party dependencies minimal. Do not embed unlicensed images or large binaries.
- Run npm run check and npm run build before submission. Never claim a deployment succeeded without verification. Use base-aware URLs from src/lib/content.ts.
- Keep existing lesson IDs stable. Draft lessons do not appear in navigation.
