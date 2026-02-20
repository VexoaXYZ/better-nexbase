# Environment Variables

Nexbase uses two types of environment variables: frontend (Vite) and backend (Convex deployment).

---

## Frontend Variables

Stored in `.env` at the project root. Prefixed with `VITE_` to be exposed to the browser.

| Variable | Required | Description |
|---|---|---|
| `VITE_CONVEX_URL` | Yes | Your Convex deployment URL |
| `VITE_WORKOS_CLIENT_ID` | Yes | WorkOS application Client ID |
| `VITE_WORKOS_REDIRECT_URI` | Yes | Auth callback URL (`http://localhost:3001/callback` for dev) |

These are validated at build time by `packages/env/`. Missing variables will cause the build to fail.

---

## Backend Variables

Set on the Convex deployment. These are not stored in `.env.local` for production — they must be set via the Convex CLI.

```bash
npx convex env set VARIABLE_NAME value
```

### Authentication

| Variable | Required | Description |
|---|---|---|
| `WORKOS_CLIENT_ID` | Yes | WorkOS application Client ID |
| `SITE_URL` | Yes | Your app URL (`http://localhost:3001` for dev) |

### Billing

| Variable | Required | Description |
|---|---|---|
| `AUTUMN_SECRET_KEY` | Yes | Autumn API secret key |

### Email

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | For emails | Resend API key |
| `RESEND_FROM_EMAIL` | For emails | Sender address (e.g., `Nexbase <noreply@yourdomain.com>`) |
| `RESEND_WEBHOOK_SECRET` | For emails | Resend webhook verification secret |
| `RESEND_TEST_MODE` | No | Set `true` to skip actual email delivery (default: `true`) |

### Organization Feature Flags

| Variable | Default | Description |
|---|---|---|
| `ORG_ENABLED` | `false` | Master toggle for organization mode |
| `ORG_FEATURE_RBAC_STRICT` | `true` | Enforce role-based access checks |
| `ORG_FEATURE_BILLING_ENFORCEMENT` | `false` | Gate features by billing plan |
| `ORG_FEATURE_INVITE_EMAILS` | `false` | Send invitation emails via Resend |
| `ORG_FEATURE_HARD_LOCKING` | `false` | Hard-lock operations on violations |
| `ORG_FEATURE_WORKOS_MIRROR_WRITES` | `false` | Sync org changes to WorkOS |

---

## Local Development

For local development, create a `.env` file at the project root:

```bash
cp .env.example .env
```

Fill in the `VITE_*` variables. Then set the backend variables on your Convex deployment:

```bash
npx convex env set WORKOS_CLIENT_ID client_xxx
npx convex env set SITE_URL http://localhost:3001
npx convex env set AUTUMN_SECRET_KEY am_sk_xxx
```

---

## Production

Update `VITE_WORKOS_REDIRECT_URI` and `SITE_URL` to your production domain.

Set all backend variables on your production Convex deployment:

```bash
npx convex env set WORKOS_CLIENT_ID client_xxx --prod
npx convex env set SITE_URL https://yourdomain.com --prod
npx convex env set AUTUMN_SECRET_KEY am_sk_live_xxx --prod
npx convex env set RESEND_API_KEY re_xxx --prod
npx convex env set RESEND_FROM_EMAIL "App <noreply@yourdomain.com>" --prod
npx convex env set RESEND_TEST_MODE false --prod
```

---

## Template Files

Both `.env.example` (root) and `packages/backend/.env.example` contain all variables with placeholder values. Copy and fill them in.
