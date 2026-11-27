import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
export default defineConfig({
  site: 'https://arashrasoulzadeh.github.io',
  base: '/learn',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), react()],
  markdown: { shikiConfig: { theme: 'github-dark' } }
});
