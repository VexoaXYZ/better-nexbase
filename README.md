# Nexbase

A production-ready full-stack TypeScript starter. Authentication, organizations, billing, and email — all wired up and working out of the box.

Built with React 19, Convex, TanStack Router, and TailwindCSS.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TailwindCSS v4, TanStack Router, Vite |
| Backend | Convex |
| Auth | WorkOS AuthKit |
| Billing | Autumn |
| Email | Resend |
| Monorepo | Turborepo, Bun |

---

## Quick Start

```bash
# Install dependencies
bun install

# Set up Convex (first time only)
bun run dev:setup

# Start everything
bun run dev
```

Open [localhost:3001](http://localhost:3001).

You will need to configure environment variables before the app fully works. See [Environment Variables](docs/environment.md).

---

## Project Structure

```
apps/web/                        Frontend application
  src/routes/                    File-based routing (TanStack Router)
  src/components/                React components
  src/hooks/                     Custom hooks
  src/lib/                       Utilities

packages/backend/convex/         Convex serverless functions
  schema.ts                      Database schema
  lib/                           Shared backend utilities (auth, RBAC, email)

packages/env/                    Environment variable validation
packages/config/                 Shared TypeScript configuration
```

---

## Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Start all apps in development |
| `bun run dev:web` | Start frontend only (port 3001) |
| `bun run dev:server` | Start Convex backend only |
| `bun run dev:setup` | First-time Convex project setup |
| `bun run build` | Build all apps |
| `bun run check-types` | TypeScript type checking |
| `bun run check` | Biome lint and format |
| `bun run prepare` | Install git hooks |

---

## Documentation

| Guide | Description |
|---|---|
| [Getting Started](docs/getting-started.md) | Full setup walkthrough from zero to running |
| [Architecture](docs/architecture.md) | How the codebase is organized |
| [Authentication](docs/authentication.md) | WorkOS auth flow, sign-in, callbacks |
| [Organizations](docs/organizations.md) | Org mode, roles, invitations, toggling on/off |
| [Billing](docs/billing.md) | Autumn integration, plans, feature gating |
| [Environment Variables](docs/environment.md) | Every env var explained |
| [Deployment](docs/deployment.md) | Shipping to production |

---

## Code Standards

All code is checked by [Biome](https://biomejs.dev) with a pre-commit hook.

- Tab indentation, double quotes
- No unused imports
- No `any` types
- SVGs require `aria-hidden="true"`
- Tailwind classes are auto-sorted in `cn()` calls

Run `bun run check` before committing.

---

## License

MIT
