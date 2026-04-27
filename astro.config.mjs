import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://lecturer-materials.pages.dev',
  integrations: [tailwind(), sitemap(), mdx()],
  output: 'static',
  vite: {
    server: {
      host: true
    }
  }
});
