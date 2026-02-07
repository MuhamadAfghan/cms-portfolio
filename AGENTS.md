# Repository Guidelines

This repository is a Vite-powered React + TypeScript app styled with Tailwind CSS and prepared for Supabase usage. Use this guide to keep contributions consistent and easy to review.

## Project Structure & Module Organization
- `src/` contains application code.
- `src/lib/` holds shared utilities (e.g., `src/lib/supabaseClient.ts`).
- `public/` stores static assets served as-is.
- `index.html` is the single-page app entry point.
- Build output goes to `dist/` (generated).

## Build, Test, and Development Commands
- `npm run dev` starts the Vite development server with hot reload.
- `npm run build` runs `tsc` and creates a production build in `dist/`.
- `npm run preview` serves the production build locally for validation.

## Coding Style & Naming Conventions
- TypeScript + React (JSX in `.tsx` files).
- Use 2-space indentation and LF line endings.
- Prefer `PascalCase` for React components (`App.tsx`) and `camelCase` for utilities.
- Keep Tailwind classes readable by grouping related styles (layout → spacing → color).
- No formatter or linter is configured; keep changes minimal and consistent with existing files.

## Testing Guidelines
- No testing framework is configured yet.
- If you add tests, also add a script (e.g., `npm test`) and document the framework and naming conventions here.

## Commit & Pull Request Guidelines
- No Git history is present in this repo, so there are no established commit conventions.
- Use Conventional Commits by default (e.g., `feat: add auth flow`, `fix: handle empty response`).
- PRs should include:
  - A brief summary of changes.
  - Any relevant screenshots for UI updates.
  - Notes on how to verify (commands or steps).

## Security & Configuration Tips
- Store credentials in `.env` files only. Use `.env.example` as the template.
- Required variables for Supabase:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
