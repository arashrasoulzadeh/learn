import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';
const categories = defineCollection({
  loader: glob({ base: './src/content/categories', pattern: '*.json' }),
  schema: z.object({ title: z.string(), description: z.string(), icon: z.string(), order: z.number().int() })
});
const concepts = defineCollection({
  loader: glob({ base: './src/content/concepts', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(), description: z.string(), category: reference('categories'),
    difficulty: z.enum(['beginner','intermediate','advanced']),
    estimatedMinutes: z.number().int().positive(), order: z.number().int().default(100),
    tags: z.array(z.string()).default([]), prerequisites: z.array(reference('concepts')).default([]),
    related: z.array(reference('concepts')).default([]), draft: z.boolean().default(false),
  })
});
export const collections = { categories, concepts };
