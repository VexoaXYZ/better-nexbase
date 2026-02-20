# Architecture

Nexbase is a Turborepo monorepo with two main workspaces and two shared packages.

---

## Workspace Layout

```
apps/web/              React frontend
packages/backend/      Convex backend
packages/env/          Environment variable validation
packages/config/       Shared TypeScript configuration
```

---

## Frontend (`apps/web/`)

React 19 app built with Vite and TanStack Router.

### Routing

Routes are file-based. Every file in `src/routes/` automatically becomes a route. The generated route tree lives at `src/routeTree.gen.ts` — never edit this file.

**Layout routes** use the `_layout` convention. A file named `_layout.tsx` wraps all sibling and child routes with shared UI (sidebar, guards, etc.).

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/auth/sign-in` | Sign in |
| `/auth/sign-up` | Sign up |
| `/callback` | WorkOS auth callback |
| `/app` | Dashboard (protected) |
| `/app/demo-paid` | Pro feature demo |
| `/app/settings/profile` | User profile |
| `/app/settings/organization` | Org settings |
| `/app/settings/members` | Team members |
| `/app/settings/billing` | Plans and billing |
| `/invite/$token` | Accept invitation |
| `/onboarding/organization` | Create first org |

### Components

```
components/
  auth/              Guards (RequireAuth, RequireOrganization)
  layout/            App shell (sidebar, auth layout)
  organization/      Org switcher, invite dialog, members list
  billing/           Pricing cards
  ui/                shadcn/ui primitives
```

### Hooks

| Hook | Purpose |
|---|---|
| `useBilling` | Returns `isPro`, customer data, billing check function |
| `useOrgMode` | Returns whether organization mode is enabled |

### Path Aliases

`@/` resolves to `apps/web/src/`. Use it for all imports within the frontend.

`@backend/` resolves to `packages/backend/`. Use it to import Convex API types.

---

## Backend (`packages/backend/convex/`)

All server logic runs on Convex. Functions are organized by domain.

### Modules

| Module | Key Functions |
|---|---|
| `users.ts` | `getCurrentUser`, `upsertUser` |
| `organizations.ts` | `create`, `listForUser`, `get`, `update`, `ensureForCurrentUser` |
| `members.ts` | `list`, `invite`, `acceptInvite`, `updateRole`, `remove` |
| `billing.ts` | `checkFeature`, `trackUsage` |
| `appConfig.ts` | `get`, `update`, `setOrgEnabled` |
| `autumn.ts` | Billing client initialization and API exports |
| `auth.ts` | WorkOS authentication setup |
| `http.ts` | HTTP route registration (webhooks) |

### Library (`convex/lib/`)

Shared backend utilities:

| File | Purpose |
|---|---|
| `authz.ts` | Authorization checks, org capability verification, RBAC |
| `capabilities.ts` | Role-based capability definitions |
| `config.ts` | Read/write runtime app configuration |
| `email.ts` | Send transactional email via Resend |
| `errors.ts` | Typed error classes |

### Schema

The database schema is defined in `schema.ts`. Tables:

- **users** — User accounts linked to WorkOS identity
- **organizations** — Workspaces with name, slug, optional WorkOS org ID
- **organizationMembers** — Role assignments (owner, admin, member)
- **organizationInvitations** — Pending invites with tokens and expiry
- **appConfigs** — Runtime configuration singleton

---

## Environment Validation (`packages/env/`)

Client-side environment variables are validated at build time using `@t3-oss/env-core`. If a required variable is missing, the app fails to start with a clear error message.

Validated variables:
- `VITE_CONVEX_URL`
- `VITE_WORKOS_CLIENT_ID`
- `VITE_WORKOS_REDIRECT_URI`

---

## Data Flow

1. User interacts with a React component
2. Component calls a Convex query or mutation via `useQuery` / `useMutation`
3. Convex function runs server-side with full type safety
4. Results are reactive — UI updates automatically when data changes
5. Auth context is passed via WorkOS tokens, verified by Convex middleware

There is no REST API layer. All client-server communication goes through Convex's real-time protocol.
