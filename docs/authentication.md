# Authentication

Nexbase uses [WorkOS AuthKit](https://workos.com/docs/authkit) for authentication. It supports email/password, social logins, and enterprise SSO out of the box.

---

## How It Works

### Sign In Flow

1. User navigates to `/auth/sign-in`
2. WorkOS AuthKit handles the login UI and identity verification
3. On success, WorkOS redirects to `/callback` with an authorization code
4. The callback route processes the code and establishes the session

### Callback Processing

The `/callback` route is the central auth handler. It runs this sequence:

1. **Validate identity** — Confirms the WorkOS user token is valid
2. **Upsert user** — Creates or updates the user record in Convex
3. **Check org mode** — Reads the `ORG_ENABLED` config flag
4. **Route the user:**
   - Org mode **off**: Navigate to `/app`
   - Org mode **on**, user has orgs: Navigate to `/app`
   - Org mode **on**, user is new: Auto-provision a personal workspace, then navigate to `/app`

### Session Management

WorkOS manages session tokens. The Convex client receives the auth token automatically through the `ConvexProviderWithAuthKit` wrapper in `main.tsx`.

On the backend, any Convex function can call `ctx.auth.getUserIdentity()` to access the authenticated user's identity.

---

## Auth Guards

Two guard components protect routes:

### RequireAuth

Wraps routes that need a logged-in user. Redirects to `/auth/sign-in` if unauthenticated.

Used at the `/app` layout level — all app routes are protected by default.

### RequireOrganization

Wraps routes that need an active organization. Redirects to `/onboarding/organization` if the user has no org membership.

Only active when organization mode is enabled. Bypassed when org mode is off.

---

## Backend Auth

Every Convex function can verify the caller:

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");
```

The `users.ts` module provides `getCurrentUser` which resolves the full user record from the identity.

The `authz.ts` library provides `requireOrgCapability` for role-based access checks — verifying the user has the right role in the target organization before allowing an operation.

---

## Configuration

### Required Environment Variables

**Frontend (.env):**
```
VITE_WORKOS_CLIENT_ID=client_xxxxxxxxx
VITE_WORKOS_REDIRECT_URI=http://localhost:3001/callback
```

**Convex deployment:**
```bash
npx convex env set WORKOS_CLIENT_ID client_xxxxxxxxx
npx convex env set SITE_URL http://localhost:3001
```

### WorkOS Dashboard Setup

1. Create a project in WorkOS
2. Enable your desired auth methods (email, Google, GitHub, SAML, etc.)
3. Add `http://localhost:3001/callback` as a redirect URI
4. Copy the Client ID into your environment variables

For production, add your production callback URL and update `SITE_URL` accordingly.
