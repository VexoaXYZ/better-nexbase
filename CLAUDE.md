# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack TypeScript monorepo using Turborepo. Frontend is React 19 with TanStack Router and Vite. Backend is Convex (serverless BaaS with real-time queries).

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TailwindCSS v4, TanStack Router, Vite |
| **Backend** | Convex (real-time database & serverless functions) |
| **Authentication** | WorkOS |
| **Payments** | Stripe |
| **Emails** | Resend |
| **Monorepo** | Turborepo, Bun |

## Commands

```bash
# Install dependencies
bun install

# Development (runs all apps)
bun run dev

# Development (individual)
bun run dev:web        # Web app only (port 3001)
bun run dev:server     # Convex backend only

# Initial Convex setup (first time only)
bun run dev:setup

# Build all
bun run build

# Type checking
bun run check-types

# Lint and format (Biome)
bun run check
```

## Architecture

```
apps/web/              # React frontend
  src/routes/          # TanStack Router file-based routes (auto-generates routeTree.gen.ts)
  src/components/ui/   # shadcn/ui components
  src/lib/             # Utilities (cn helper for classnames)

packages/backend/convex/   # Convex backend functions
  schema.ts            # Database schema (Convex tables)
  _generated/          # Auto-generated types (don't edit)

packages/env/          # Centralized environment validation (@t3-oss/env-core)
packages/config/       # Shared TypeScript config
```

## Key Patterns

- **Routing**: TanStack Router with file-based routes. Routes in `apps/web/src/routes/` auto-generate `routeTree.gen.ts`
- **Styling**: Tailwind CSS v4 with shadcn/ui. Use `cn()` from `@/lib/utils` for conditional classes
- **Backend**: Convex queries/mutations in `packages/backend/convex/`. Use `useQuery`/`useMutation` from `convex/react`
- **Path aliases**: `@/` maps to `apps/web/src/`
- **Environment**: Validated via `@better-nexbase/env`. Web uses `VITE_CONVEX_URL`

## Code Style (Biome)

**IMPORTANT: All code must be Biome-compliant. A pre-commit hook enforces this.**

### Formatting Rules
- Tab indentation (not spaces)
- Double quotes for strings
- Tailwind classes are auto-sorted in `clsx`, `cva`, `cn` calls

### Linting Rules to Follow
- **No unused imports** - Remove all unused imports
- **No explicit `any`** - Use proper types or `unknown`
- **No empty `{}` type** - Use `object`, `unknown`, or `Record<string, never>`
- **No array index as key** - Use unique identifiers for React keys
- **Accessibility**:
  - SVGs need `aria-hidden="true"` if decorative
  - Anchors need valid `href` (not `#`) and accessible content
  - Use `<span className="sr-only">` for icon-only links

### Before Committing
Always run `bun run check` to verify Biome compliance. The pre-commit hook will reject non-compliant code.
