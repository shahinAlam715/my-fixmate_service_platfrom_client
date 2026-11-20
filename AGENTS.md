<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Single-package Next.js 16.4.6 (App Router) client app. React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui. No monorepo, no test runner, no CI. The stock `README.md` is stale (points at `app/page.tsx`, which doesn't exist — pages live under `src/app/`); don't follow it.

**This repo is frontend only.** All business data is fetched from a separate backend repo running at `NEXT_PUBLIC_SERVER_URL` (`http://localhost:5000` in `.env`); data pages fail without it. Auth (better-auth + MongoDB Atlas + Google OAuth) is served by this app itself.

## Commands

- `npm run dev` — dev server (also regenerates the block above and `.next/types`)
- `npm run build` — production build
- `npm start` — serve a production build
- `npx tsc --noEmit` — typecheck (no npm script exists; don't guess one)
- `npm run lint` — ESLint flat config (`eslint.config.mjs`)
- No test runner exists. Don't invent test commands.

Verify with `npx tsc --noEmit` then `npm run lint`.

**Typecheck quirk:** `src/app/layout.tsx` uses the generated type `LayoutProps<"/">`, declared only in `.next/types/routes.d.ts`. On a fresh clone with no `.next/`, `tsc --noEmit` fails until `next build` or `next dev` has run once.

**Lint quirk:** `npm run lint` currently exits 1 on two pre-existing `react-hooks/set-state-in-effect` errors in `src/hooks/use-mobile.ts` and `src/components/ui/carousel.tsx` (plus 9 warnings). These are not your regression — check for *new* errors only.

## Environment

`.env` is gitignored, so a fresh clone has none. The code reads: `NEXT_PUBLIC_SERVER_URL` (backend base URL), `MONGODB_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_IMGBB_API_KEY` (image uploads). Auth also hardcodes trusted origins in `src/lib/auth.ts`.

## Structure

- `src/app/(public)/` — public pages behind Navbar+Footer: `/`, `/about`, `/services`, `/sign-in`, `/sign-up`, `/update-profile`
- `src/app/{customer,technician,admin}/dashboard/` — three role dashboards; each `layout.tsx` renders `<DashboardSidebar role="...">`. Add/remove sidebar links only in `NAV_ITEMS` in `src/components/DashboardSidebar.tsx`.
- `src/app/api/auth/[...all]/route.ts` — better-auth handler. Config in `src/lib/auth.ts` (roles `customer|technician|admin` as an additional user field); browser client in `src/lib/auth-client.ts`. Server-side session: `auth.api.getSession({ headers: await headers() })`.
- `src/all-api/` — fetch helpers for the backend: `server-serviceapi.ts` is `server-only` and session-aware; `serviceapi.ts` / `userapi.ts` are plain `fetch` calls actively imported by pages (some legacy functions commented out inside `serviceapi.ts`); `bookingapi.ts` exists but is imported nowhere.
- `src/components/ui/` — 60+ shadcn-generated primitives; hand-edit only when intentional
- `src/components/*.tsx` — app components (`Navbar`, `Footer`, `DashboardSidebar`, ...)
- `src/hooks/`, `src/lib/` — shared hooks; `src/lib/utils.ts` re-exports `cn`

## Toolchain quirks

- **shadcn style is `base-nova`** (`components.json`): primitives wrap `@base-ui/react`, **not Radix** — don't follow Radix-based shadcn examples when adding components. `cn` comes from the `cn` npm package; generated files import it directly (`import { cn } from "cn"`).
- **Tailwind v4 has no `tailwind.config` file.** Config lives in `src/app/globals.css` (`@import "tailwindcss"`, `@theme inline`). CSS compiles through the `@tailwindcss/turbopack` loader wired in `next.config.ts` — don't remove that rule.
- **`import "server-only"` works without being installed** — Next resolves it from its own compiled copy; don't add it as a dependency.
- **Path alias:** `@/*` → `./src/*`.
- **Next 16 docs** are vendored at `node_modules/next/dist/docs/` — consult them instead of relying on trained knowledge (see block above).
