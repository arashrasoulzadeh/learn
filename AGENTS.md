# Learn — contributor instructions

- Keep Astro static output compatible with GitHub Pages; no server or database required.
- Add concepts in src/content/concepts/<category>/<slug>.mdx, category metadata in src/content/categories. Do not hardcode lesson routes or navigation.
- Default lesson and interface language: Persian (fa-IR). Use RTL layouts and Persian digits for UI labels. Keep standard protocol messages, identifiers and code in English and explicitly LTR. Keep prose approachable and technical claims accurate. Distinguish protocol guarantees from common implementation choices.
- Every lesson must contain a motivation, mental model, visual explanation or interactive demo, practical example, pitfalls, knowledge check, takeaway and authoritative references.
- Use accessible controls, labels, keyboard navigation, reduced-motion support and text alternatives. Keep browser storage optional. Avoid collecting user data.
- Use local reusable components; keep third-party dependencies minimal. Do not embed unlicensed images or large binaries.
- Before pushing changes run `npm run verify` (server checks, Astro typecheck, production build and all Playwright tests). Install Chromium with `npx playwright install chromium` first. Push directly to main without pull requests. Run all checks before updating main. Playwright must exercise the production build via Astro preview, not the dev server. When local execution is blocked, use a temporary verify/* branch solely for CI (no PR or deployment); fast-forward main to the exact tested commit only after the entire build job succeeds. If verification fails or remains incomplete, do not update main. Update tests when translating UI and use stable route identifiers for discovery assertions. Never claim a deployment succeeded without verification. Use base-aware URLs from src/lib/content.ts.
- Keep existing lesson IDs stable. Draft lessons do not appear in navigation.

## Immersive presentation
The homepage opens the first HTTP lesson directly. All published lessons use LessonScreen, a full-width learning-only layout without site navigation or marketing. Put the explanation inside the interactive experience; keep extended author notes under docs/lessons. The existing catalog and search are optional standalone routes, not part of the learning screen.

## Shared learning components
Use LearningHeader, LessonPicker, AboutProject and Popover for lesson chrome. Use LabUI (playback hook, controls, timeline, stage, message and screen) and FlowDiagram (nodes, edges and directional packets) for new interactive lessons. Keep lesson-specific data and logic in the lesson component. Persian diagrams should start on the right, with response paths returning to the right; protocol text remains LTR. The lesson picker is curated in LessonPicker.astro.
