// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://galabau-fortkamp.de',
  integrations: [
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de-DE' }
      }
    })
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: '0.0.0.0',
    port: 4321
  },
  build: {
    inlineStylesheets: 'auto'
  }
});
