# Getting Started

This guide walks you through setting up Nexbase from a fresh clone to a running app.

---

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- A [Convex](https://convex.dev) account
- A [WorkOS](https://workos.com) account

---

## 1. Install Dependencies

```bash
bun install
```

This installs all packages across the monorepo.

---

## 2. Set Up Convex

```bash
bun run dev:setup
```

Follow the prompts to create a new Convex project. This generates your deployment URL and connects the backend.

---

## 3. Configure Environment Variables

Two files need configuration:

**Root `.env`** (for the frontend):
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_WORKOS_CLIENT_ID=client_xxxxxxxxx
VITE_WORKOS_REDIRECT_URI=http://localhost:3001/callback
```

**Convex deployment environment** (for the backend):
```bash
npx convex env set WORKOS_CLIENT_ID client_xxxxxxxxx
npx convex env set SITE_URL http://localhost:3001
npx convex env set AUTUMN_SECRET_KEY am_sk_xxx
npx convex env set RESEND_API_KEY re_xxx
```

See [Environment Variables](environment.md) for the full list.

---

## 4. Configure WorkOS

In your WorkOS dashboard:

1. Create a new project
2. Copy the Client ID into your env vars
3. Set the redirect URI to `http://localhost:3001/callback`
4. Enable the authentication methods you want (email/password, Google, GitHub, etc.)

---

## 5. Start Development

```bash
bun run dev
```

This starts both the frontend (port 3001) and the Convex backend simultaneously.

You can also run them separately:

```bash
bun run dev:web       # Frontend only
bun run dev:server    # Backend only
```

---

## 6. Verify It Works

1. Open [localhost:3001](http://localhost:3001)
2. Click Sign In
3. Create an account through WorkOS
4. You should land on the dashboard at `/app`

If organization mode is enabled, you will be routed through onboarding to create your first workspace.

---

## Next Steps

- [Architecture](architecture.md) — Understand how the codebase is organized
- [Authentication](authentication.md) — Learn the auth flow in detail
- [Organizations](organizations.md) — Enable multi-tenant workspaces
- [Billing](billing.md) — Set up plans and feature gating
