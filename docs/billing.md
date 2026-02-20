# Billing

Nexbase uses [Autumn](https://useautumn.com) for billing. Autumn handles checkout, subscriptions, usage tracking, and feature gating through a simple API.

---

## How It Works

Billing is scoped to organizations. Each org maps to a single Autumn customer. When a user triggers a checkout or feature check, Autumn resolves the customer from the authenticated user's default organization.

### Key Concepts

- **Products** define plans (e.g., "Free", "Pro")
- **Features** define gated capabilities within a product
- **`check`** verifies if a customer has access to a feature or product
- **`track`** records usage against a metered feature
- **`checkout`** opens a payment dialog for upgrading

---

## Setup

### 1. Create an Autumn Account

Sign up at [useautumn.com](https://useautumn.com) and create a project.

### 2. Configure Products

In the Autumn dashboard, create your products. At minimum, create a product with the ID `pro`. The free tier is implicit — users without a paid product are on the free plan.

### 3. Set the Secret Key

```bash
npx convex env set AUTUMN_SECRET_KEY am_sk_xxx
```

Get your secret key from the Autumn dashboard under API Keys.

---

## Backend Integration

### Client (`convex/autumn.ts`)

The Autumn client is initialized with an `identify` callback that resolves the current user's organization as the billing customer:

```
User authenticates → identify() resolves their default org → Autumn maps org to customer
```

If the user has no organization, billing falls back to user-level identification.

### Billing Functions (`convex/billing.ts`)

Two server-side actions wrap Autumn's API:

**`checkFeature(organizationId, featureId)`**
Verifies if the org's plan includes a specific feature.

**`trackUsage(organizationId, featureId, value?)`**
Records usage against a metered feature for the org.

---

## Frontend Integration

### Provider

`AutumnProvider` wraps the app in `main.tsx`, passing the Convex client and API reference. This enables all Autumn React hooks.

### Hooks

**`useCustomer()`** (from `autumn-js/react`)
Returns the customer object, `check` function, and `checkout` function.

**`useBilling()`** (from `@/hooks/use-billing`)
A convenience wrapper that returns:
- `isPro` — boolean indicating if the customer has the "pro" product
- `customer` — the full customer object
- `isLoading` — whether customer data is still loading

### Checking Pro Status

```typescript
const { isPro } = useBilling();

if (isPro) {
  // Show pro features
} else {
  // Show upgrade prompt
}
```

### Triggering Checkout

```typescript
const { checkout } = useCustomer();

checkout({
  productId: "pro",
  dialog: CheckoutDialog,
});
```

This opens Autumn's built-in checkout dialog. No redirect needed.

---

## Pages

### Billing Settings (`/app/settings/billing`)

Shows the current plan status and pricing cards. Only visible to org owners. Includes:
- Current plan banner with manage/upgrade action
- Free vs Pro comparison cards
- Checkout integration on the Pro card

### Demo Paid (`/app/demo-paid`)

A gated page that demonstrates feature locking. Shows different content based on whether the user is on the Pro plan. Useful as a reference for implementing your own gated features.

### Sidebar Upgrade CTA

When the user is on the free plan, a small upgrade prompt appears in the sidebar linking to billing settings.

---

## Adding Your Own Gated Features

1. Define the feature in the Autumn dashboard
2. Use `useBilling()` on the frontend to check access
3. Use `checkFeature()` on the backend for server-side enforcement

```typescript
// Frontend
const { isPro } = useBilling();

// Backend
const result = await autumn.check(ctx, {
  featureId: "advanced-analytics",
});
if (!result.data?.allowed) {
  throw new Error("Upgrade required");
}
```

Always enforce on the backend. Frontend checks are for UI only.
