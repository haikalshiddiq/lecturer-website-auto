import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://hicall.web.id',
  integrations: [sitemap(), mdx()],
  output: 'static',
  vite: {
    server: {
      host: true
    }
  }
});
