import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://futbolexperto.com',
  integrations: [sitemap()],
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
});