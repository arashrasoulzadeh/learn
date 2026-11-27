# Contributing to Learn

## Add a concept

Run `npm run new:concept -- networking dns` (replace category and slug). Edit the generated MDX and set draft to false when ready. Each lesson has a stable ID of category/slug. Add category metadata as a JSON file in src/content/categories if needed. The catalog and routes discover content automatically.

Required frontmatter: title, description, category, difficulty, estimatedMinutes. Optional: order, tags, prerequisites, related, draft. References use full IDs such as networking/http-request.

## Lesson structure

Start with a motivating problem and learning outcomes. Explain the mental model, include a visual or interactive example, concrete code or protocol messages, trade-offs, mistakes, a knowledge check, summary, and reliable primary references. Use original illustrations and code. Explain limitations of simulations. Do not invent benchmarks.

## Components

Use Callout, Quiz and VideoPlayer from src/components/learning. Add new simulations as focused React components and hydrate with client:visible. Keep content in MDX, styling in reusable CSS, and state local. Media should have captions or text equivalents and should not autoplay sound.

## Validation

Run npm install, npm run check and npm run build. Preview under /learn/. Check keyboard navigation, small screens, light and dark themes, reduced motion and error scenarios. Publish through a pull request after the initial bootstrap.
