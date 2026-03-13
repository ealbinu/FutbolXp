import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://futbolexperto.com',
  integrations: [],

  // Vite config is automatically applied
  output: 'static',

  adapter: cloudflare()
});