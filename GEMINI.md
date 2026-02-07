# Project Overview

This project is a CMS Portfolio template built with React, TypeScript, Vite, and Tailwind CSS. It integrates with Supabase for backend services, providing a foundation for users to connect their content management system to a modern frontend.

## Technologies Used

*   **Frontend Framework:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (with DaisyUI)
*   **Backend Integration:** Supabase (via `@supabase/supabase-js` and Supabase CLI)
*   **Routing:** React Router DOM

## Building and Running

The project uses Vite for development and building.

*   **Development Server:**
    ```bash
    npm run dev
    ```
    This command starts a development server with hot module replacement.

*   **Build for Production:**
    ```bash
    npm run build
    ```
    This command compiles the TypeScript code and bundles the application for production.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```
    This command serves the production build locally for testing.

## Supabase Configuration

This project expects Supabase environment variables to be set. Specifically, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for the Supabase client to initialize correctly. These can be set in a `.env` file (e.g., `.env.local` or `.env` as per Vite's environment variable handling).

Example `.env` file:

```
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### Supabase CLI Commands

The `package.json` also defines scripts for interacting with the Supabase CLI:

*   **Push local changes to Supabase:**
    ```bash
    npm run db:push
    ```
*   **Pull remote schema from Supabase:**
    ```bash
    npm run db:pull
    ```
*   **Show diff of local and remote schema:**
    ```bash
    npm run db:diff
    ```
*   **Reset local Supabase database:**
    ```bash
    npm run db:reset
    ```

## Development Conventions

*   **Code Formatting:** (TODO: Investigate if Prettier/ESLint are configured)
*   **TypeScript:** Strict TypeScript checks are enabled.
*   **Styling:** Utility-first CSS with Tailwind CSS and DaisyUI components.
*   **Project Structure:** Standard Vite/React project structure with `src` containing application code.
*   **State Management:** Context API is used for global state (e.g., `src/contexts`).
*   **Routing:** React Router DOM for client-side routing.
*   **Schema Definitions:** Zod schemas are used for validation (e.g., `src/schemas`).