# Gemini Code Assistant Context

This document provides context for the Gemini AI assistant to understand and effectively assist with development in the **Astrology i18n** project.

## Project Overview

This is a multilingual blog and portfolio theme built with the [Astro](https://astro.build/) web framework. Its core features include internationalization (i18n), content collections for blog posts and pages, and a modern development stack using Tailwind CSS and TypeScript. The project is designed to be a ready-to-use solution for global-focused, content-driven websites.

**Key Technologies:**
- **Framework:** Astro
- **Styling:** Tailwind CSS (v4)
- **UI Languages:** TypeScript
- **Content:** Markdown / MDX
- **i18n:** Built-in Astro i18n features
- **Search:** Pagefind
- **SEO:** astro-seo, per-locale RSS feeds, and sitemaps

## Building and Running

The project uses `npm` for dependency management and running scripts.

- **Install Dependencies:**
  ```bash
  npm install
  ```

- **Run Development Server:**
  Starts a local development server with hot-reloading.
  ```bash
  npm run dev
  ```

- **Build for Production:**
  Builds the static site to the `dist/` directory.
  ```bash
  npm run build
  ```

- **Preview Production Build:**
  Starts a local server to preview the production build from `dist/`.
  ```bash
  npm run preview
  ```

## Development Conventions

### Content Management

The site uses Astro's **Content Collections** to manage and validate content. The schemas are defined in `src/content.config.ts`.

- **Blog Posts:** Create new `.md` or `.mdx` files under `src/content/posts/<lang>/`. The `<lang>` directory must be one of the supported language codes (e.g., `en`, `zh`).
- **Pages:** Static pages like "About" are managed in `src/content/pages/<lang>/`.
- **Authors:** Author information is stored in `src/content/authors/<lang>/`.

**Post Frontmatter Schema (`src/content/config.ts`):**
```typescript
{
  title: string,
  description: string,
  category: string,
  tags: string[],
  pubDate: Date,
  updatedDate?: Date,
  author: string,
  heroImage: string, // URL
  heroImageAlt: string,
  locales: 'zh' | 'en' | 'fr' | 'es' | 'ru' | 'ja' | 'ko' | 'pt' | 'de' | 'id',
  draft: boolean,
  featured: boolean,
}
```

### Internationalization (i18n)

- **Supported Languages:** `zh` (default), `en`, `fr`, `es`, `ru`, `ja`, `ko`, `pt`, `de`, `id`.
- **UI Translations:** UI strings (e.g., button labels, navigation) are stored in JSON files in the `src/i18n/` directory, with one file per language (e.g., `en.json`).
- **Routing:**
    - Routing is language-prefixed (e.g., `/en/posts/`, `/zh/about/`).
    - The default locale (`zh`) is also prefixed, meaning there is no non-prefixed root for content pages (`/` is a dedicated landing page).
    - The middleware at `src/middleware.ts` handles this routing logic.

### Code and Styling

- **Code Formatting:** The project uses Prettier for automatic code formatting. The configuration is in `.prettierrc`. While there is no explicit format script in `package.json`, it's good practice to run it before committing.
- **Styling:** Global styles are defined in `src/styles/global.css`. Most styling is done via Tailwind CSS utility classes directly in `.astro` and `.mdx` files.
