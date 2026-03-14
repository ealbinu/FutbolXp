import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://futbolexperto.com',
  integrations: [],
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  // Vite config is automatically applied
});