# Organizations

Nexbase has a full multi-tenant organization system that can be toggled on or off at runtime.

---

## Overview

When enabled, organizations provide:

- Named workspaces with URL slugs
- Role-based access (owner, admin, member)
- Email invitations with token-based acceptance
- Organization switching in the sidebar
- Scoped settings, billing, and member management

When disabled, users get a simple personal workspace with no org UI.

---

## Toggling Org Mode

### Enable

```bash
npx convex env set ORG_ENABLED true
```

### Disable

```bash
npx convex env set ORG_ENABLED false
```

The env-level flag is the hard lock. When set to `false`, runtime overrides cannot re-enable it.

There is also a runtime toggle via `api.appConfig.setOrgEnabled`, but it is subordinate to the env flag.

---

## What Changes When Org Mode Is Off

- Auth still works normally
- Users are routed directly to `/app` after login
- A personal workspace is auto-provisioned in the background
- The sidebar hides the org switcher and org-related settings
- Organization and Members settings pages show a disabled state
- Non-critical org mutations return `{ applied: false, reason: "org_disabled" }`
- Critical org operations throw `[ORG_DISABLED]` errors

---

## What Changes When Org Mode Is On

- New users are routed through onboarding to create or join an organization
- The sidebar shows the org switcher
- Organization, Members, and Billing settings are accessible
- RBAC is enforced on all org operations

---

## Roles

| Role | Capabilities |
|---|---|
| **Owner** | Full control. Manage billing, delete org, transfer ownership. |
| **Admin** | Manage members, update org settings. Cannot delete org or manage billing. |
| **Member** | Access org resources. Cannot manage settings or members. |

Roles are enforced on both frontend (UI visibility) and backend (capability checks in `authz.ts`).

---

## Invitations

Admins and owners can invite new members:

1. Open Members settings
2. Click Invite Member
3. Enter email and select role
4. An invitation is created with a unique token

If Resend is configured, an email is sent automatically. The invite link is always available to copy manually.

Invitations expire after 7 days.

### Accepting an Invite

The recipient visits `/invite/{token}`. If they are logged in, they see the org details and can accept or decline. If not logged in, they are prompted to sign in first.

---

## Enabling Org Mode Mid-Project

If you start with org mode off and enable it later:

1. Existing users remain authenticated
2. Users without an org will be routed to onboarding on their next visit
3. Users who already have memberships continue normally
4. Org UI elements reappear automatically
5. Previously disabled org operations become active

### Recommended rollout:

```bash
npx convex env set ORG_ENABLED true
npx convex env set ORG_FEATURE_RBAC_STRICT true
```

Restart the dev server, then verify with:
- A user with no org (should see onboarding)
- A user with an org (should see the dashboard)

---

## Feature Flags

Additional org behavior is controlled by these flags:

| Flag | Default | Purpose |
|---|---|---|
| `ORG_ENABLED` | `false` | Master toggle for org mode |
| `ORG_FEATURE_RBAC_STRICT` | `true` | Enforce role-based access checks |
| `ORG_FEATURE_BILLING_ENFORCEMENT` | `false` | Gate features by billing plan |
| `ORG_FEATURE_INVITE_EMAILS` | `false` | Send invitation emails via Resend |
| `ORG_FEATURE_HARD_LOCKING` | `false` | Hard-lock org operations on violation |
| `ORG_FEATURE_WORKOS_MIRROR_WRITES` | `false` | Mirror org changes to WorkOS |

Set them via:
```bash
npx convex env set FLAG_NAME value
```

---

## Troubleshooting

**"I changed `.env.local` but nothing happened"**
Convex functions read from the deployment environment, not `.env.local`. Use `npx convex env set`.

**Runtime toggle shows enabled but app is still disabled**
The env-level `ORG_ENABLED=false` is a hard lock that overrides runtime toggles.

**User stuck on onboarding with org mode off**
Restart the dev server and confirm `api.appConfig.get` returns `org.enabled: false`.

**User has memberships but no `defaultOrganizationId`**
The backend auto-resolves the first active membership as fallback and heals the default selection during provisioning.
