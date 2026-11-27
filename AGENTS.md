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

## Curriculum
The `web-basics` learningPath in content metadata supplies the ordered level-one picker. New protocol labs use NetworkLab plus per-lesson typed scenario data; each scenario has concrete packets, direction, result, and a distinct outcome. Include a concept-specific knowledge check, pitfalls, references, desktop/mobile browser tests, and verify all scenarios. Keep the existing HTTP lab as the reference implementation.

Run `npm run check:network` to audit the ten level-one lessons and ensure valid scenario routes, examples and quiz data. The production browser suite must exercise every scenario and every step of all ten lessons.

For each level-one lab, keep notes, references and knowledge checks in the shared toolbar dialog, not the detail column. Include selectable edge cases with full alternative stages, practical explanations for every step, a readable actor route, and separate directional lanes for request/return. Use a single paced motion per step, with static arrows for reduced motion. Verify the dialogs, every scenario, and geometry in Playwright.

## Final educational review standard
Keep the concrete state snapshot beside the stage's first explanation; distinguish snapshots from on-wire animation. Each lesson needs a learning goal, normal and edge scenarios, a transfer exercise with corrective feedback, and an optional bounded real-world observation (local-only for write or failure tests). Keep the next lesson link tied to a correct applied-practice response; this is guidance, not a mastery certificate. Review CI screenshots on desktop and phone rather than relying solely on green tests. Use accurate RFC references and explicit simplifications for illustrative protocol messages. Never claim real-world exercises were executed unless they actually were.

## Level two
Publish the ten `backend-basics` lessons in order 11–20 under software-engineering. BackendLab shares level-one controls, dialog, state inspector and applied practice. Use local, illustrative code and explicit runtime/framework assumptions. For access-control examples validate server-side identity, operation and resource permissions; JWT demonstrations must not use real credentials. Run check:backend and per-lesson browser tests before main.

## Level three
Data lessons 21–30 use `data-basics` under databases. Reuse shared BackendLab, with database-specific state cards and explicit isolation, failure and consistency assumptions. Existing server-infrastructure lessons stay accessible; database pooling and replication focus on data semantics. Include check:data in verification and verify each scenario and next-level link.

## Advanced engineering labs
Every curated lesson (levels one–three) must expose its distinct advanced trace. Include at least two comparable policies or conditions, concrete initial state, chronological events with valid lanes and state patches, final tradeoffs, code or wire examples, diagnostics and official references. Model time explicitly as illustrative; do not claim the traces execute the real protocol or database. Keep state differences observable and compare outputs only after a trace ends. Run check:deep and per-lesson Playwright tests before main.

## Primary lesson playback and evidence
Each curated stage must have a concrete developer diagnostic and a label for every animated flight, including distinct return messages. Model packet drops explicitly; do not treat an HTTP rejection as a lost packet. Keep the final state snapshot (with before/after differences) inside the canvas, and put the actual input/output beside the mechanism explanation. Manual selection and replay animate only the selected stage; autoplay progresses the scenario. Local steps pulse the affected component. Respect reduced motion, preserve RTL message order and inspect real screenshots before declaring visual review complete.
