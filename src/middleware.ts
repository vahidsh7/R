import { middleware as i18nMiddleware } from 'astro:i18n';

// When using `routing: 'manual'`, Astro expects custom middleware to drive
// locale handling. Reuse Astro's built-in middleware with the previous routing
// options so behavior remains unchanged while avoiding duplicate prerendered routes.
export const onRequest = i18nMiddleware({
  prefixDefaultLocale: true,
  redirectToDefaultLocale: false,
  fallbackType: 'rewrite',
});
