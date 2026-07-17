import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config/site';
import remarkSolutionTitle from './src/lib/remark-solution-title.mjs';

const deploymentSite = process.env.SITE_URL ?? site.url;
const deploymentBase = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: deploymentSite,
  base: deploymentBase,
  output: 'static',
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    processor: unified({ remarkPlugins: [remarkSolutionTitle] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
