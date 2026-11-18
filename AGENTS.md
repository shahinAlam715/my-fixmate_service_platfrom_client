<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Single-package Next.js 16.4.6 (App Router) client app. React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui. No monorepo, no test suite, no CI. Entry: `src/app/` — only the root `/` page exists so far.

## Commands

- `npm run dev` — dev server (also regenerates the block above and `.next/types`)
- `npm run build` — production build
- `npx tsc --noEmit` — typecheck (no npm script exists; don't guess one)
- `npm run lint` — ESLint flat config (`eslint.config.mjs`)
- No test runner exists. Don't invent test commands.

Verify with `npx tsc --noEmit` then `npm run lint`.

**Typecheck quirk:** `src/app/layout.tsx` uses the generated type `LayoutProps<"/">`, declared only in `.next/types/routes.d.ts`. On a fresh clone with no `.next/`, `tsc --noEmit` fails until `next build` or `next dev` has run once.

**Lint quirk:** `npm run lint` currently exits 1 on two pre-existing `react-hooks/set-state-in-effect` errors in `src/hooks/use-mobile.ts` and `src/components/ui/carousel.tsx`. These are not your regression — check for *new* errors only.

## Structure

- `src/app/` — App Router pages/layout; `globals.css` holds all styling config
- `src/components/ui/` — 60+ shadcn-generated primitives; hand-edit only when intentional
- `src/components/*.tsx` — app components (`Navbar`, `Footer`)
- `src/hooks/`, `src/lib/` — shared hooks; `src/lib/utils.ts` re-exports `cn`

## Toolchain quirks

- **shadcn style is `base-nova`** (`components.json`): primitives wrap `@base-ui/react`, **not Radix** — don't follow Radix-based shadcn examples when adding components. `cn` comes from the `cn` npm package; generated files import it directly (`import { cn } from "cn"`).
- **Tailwind v4 has no `tailwind.config` file.** Config lives in `src/app/globals.css` (`@import "tailwindcss"`, `@theme inline`). CSS compiles through the `@tailwindcss/turbopack` loader wired in `next.config.ts` — don't remove that rule.
- **Path alias:** `@/*` → `./src/*`.
- **Next 16 docs** are vendored at `node_modules/next/dist/docs/` — consult them instead of relying on trained knowledge (see block above).
