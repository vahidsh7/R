import astroExpressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import pagefind from 'astro-pagefind';
import { defineConfig } from 'astro/config';
import { remarkModifiedTime } from './src/utils/remark-modified-time.mjs';

export default defineConfig({
  // ✅ CORRECTED: Site should be the root domain, not including repository
  site: 'https://muctebanesiri.github.io',
  // ✅ CORRECTED: Base must match your repository name with trailing slash
  base: '/R/',
  trailingSlash: 'always',

  prefetch: {
    defaultStrategy: 'viewport',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['zh', 'en', 'fr', 'es', 'ru', 'ja', 'ko', 'pt', 'de', 'id'],
    routing: 'manual',
  },

  // ✅ IMPORTANT: Remove unsplash from remote patterns to prevent fetch errors
  image: {
    responsiveStyles: true,
    layout: 'constrained',
    remotePatterns: [], // Empty array = no remote image fetching
  },

  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },

  integrations: [
    astroExpressiveCode({
      themes: ['github-dark', 'github-light'],
      themeCssSelector: (theme) => (theme.type === 'dark' ? '.dark' : ''),
    }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          zh: 'zh-CN',
          en: 'en-US',
          fr: 'fr-FR',
          es: 'es-ES',
          ru: 'ru-RU',
          ja: 'ja-JP',
          ko: 'ko-KR',
          pt: 'pt-PT',
          de: 'de-DE',
          id: 'id-ID',
        },
      },
    }),
    mdx(),
    pagefind(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    icon({
      include: {
        lucide: ['*'],
      },
    }),
  ],
});