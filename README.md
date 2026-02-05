# better-nexbase

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service platform
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
bun run dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

Copy environment variables from `packages/backend/.env.local` to `apps/*/.env`.

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Your app will connect to the Convex cloud backend automatically.

## Organization Mode (On/Off)

This project now supports a runtime organization mode control plane.

### Source of truth and precedence

1. Env defaults from Convex deployment env (`npx convex env set ...`)
2. Runtime DB override in `appConfigs` (`api.appConfig.update`, `api.appConfig.setOrgEnabled`)

Important: `ORG_ENABLED=false` in env is a hard safety lock and wins over runtime overrides.

### Flags

- `ORG_ENABLED`
- `ORG_FEATURE_RBAC_STRICT`
- `ORG_FEATURE_BILLING_ENFORCEMENT`
- `ORG_FEATURE_INVITE_EMAILS`
- `ORG_FEATURE_HARD_LOCKING`
- `ORG_FEATURE_WORKOS_MIRROR_WRITES`

### When org mode is disabled

- Auth still works.
- Callback routes users to `/app` (not org onboarding).
- Callback pre-provisions a personal workspace in the background so future org enablement is seamless.
- Org guard (`RequireOrganization`) is bypassed.
- Sidebar hides org switcher and org/member settings links.
- Org/members settings pages show a clear "unavailable while org mode is disabled" state.
- Non-critical org mutations may return:
  - `{ applied: false, reason: "org_disabled", operation: string }`
- Critical org operations throw typed errors like:
  - `[ORG_DISABLED] ...`

### When org mode is enabled

- Normal org onboarding/membership flows apply.
- Users without organizations are auto-provisioned a personal workspace, then continue to `/app`.
- RBAC and capability checks are enforced by backend guards.

### Enable org mode mid-project (what happens)

If you start with org mode disabled and enable later:

1. Existing users remain valid/authenticated.
2. Users with no org will be routed to onboarding on next callback/protected org check.
3. Users who already have org memberships continue normally.
4. Org settings and members UI links reappear automatically.
5. Any previously disabled org-only operations become active again.

Recommended rollout:

1. Enable in deployment env:
   - `npx convex env set ORG_ENABLED true`
2. Keep strict RBAC on:
   - `npx convex env set ORG_FEATURE_RBAC_STRICT true`
3. Restart backend dev process (`bun run dev:server`) if running locally.
4. Verify by signing in with:
   - a user with no org (should go to onboarding),
   - a user with an org (should go to `/app`).

### Common edge cases

- **"I changed `.env.local` but behavior did not change"**
  - Convex uses deployment env; run `npx convex env set ...`.
- **Runtime toggle says enabled but app still disabled**
  - Env hard lock is off? If `ORG_ENABLED=false` in env, runtime cannot override it.
- **User stuck on onboarding while org disabled**
  - Ensure frontend is rebuilt/restarted after updates and confirm `api.appConfig.get` returns `org.enabled: false`.
- **User has memberships but no `defaultOrganizationId`**
  - Backend resolves first active membership as fallback context and auto-heals default selection during provisioning.

## Git Hooks and Formatting

- Initialize hooks: `bun run prepare`
- Format and lint fix: `bun run check`

## Project Structure

```
better-nexbase/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
├── packages/
│   ├── backend/     # Convex backend functions and schema
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:setup`: Setup and configure your Convex project
- `bun run check-types`: Check TypeScript types across all apps
- `bun run check`: Run Biome formatting and linting
