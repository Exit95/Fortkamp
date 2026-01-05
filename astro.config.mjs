// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://test.danapfel-digital.de',
  integrations: [
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de-DE' }
      }
    })
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  }
});
