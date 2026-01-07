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
  experimental: {
    session: {
      driver: 'fs'
    }
  },
  build: {
    inlineStylesheets: 'auto'
  }
});
