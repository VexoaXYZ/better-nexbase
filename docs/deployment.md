# Deployment

This guide covers deploying Nexbase to production.

---

## Backend (Convex)

Convex hosts your backend automatically. Deploy with:

```bash
npx convex deploy
```

This pushes your functions, schema, and configuration to the production Convex deployment.

### Production Environment Variables

Set all required variables on your production deployment:

```bash
npx convex env set WORKOS_CLIENT_ID client_xxx --prod
npx convex env set SITE_URL https://yourdomain.com --prod
npx convex env set AUTUMN_SECRET_KEY am_sk_live_xxx --prod
npx convex env set RESEND_API_KEY re_xxx --prod
npx convex env set RESEND_FROM_EMAIL "App <noreply@yourdomain.com>" --prod
npx convex env set RESEND_TEST_MODE false --prod
npx convex env set ORG_ENABLED true --prod
```

See [Environment Variables](environment.md) for the full list.

---

## Frontend

The frontend is a standard Vite app. It builds to static files.

```bash
bun run build
```

Output is in `apps/web/dist/`. Deploy this to any static hosting provider.

### Hosting Options

**Vercel**
Connect your GitHub repo. Set the root directory to `apps/web`. Add environment variables in the Vercel dashboard.

**Netlify**
Same approach. Set build command to `bun run build` and publish directory to `apps/web/dist`.

**Cloudflare Pages**
Connect your repo. Set build command and output directory. Add environment variables in the dashboard.

**Self-hosted**
Serve the `dist/` folder with any static file server (Nginx, Caddy, etc.).

### Frontend Environment Variables

Set these in your hosting provider's environment configuration:

```
VITE_CONVEX_URL=https://your-production.convex.cloud
VITE_WORKOS_CLIENT_ID=client_xxx
VITE_WORKOS_REDIRECT_URI=https://yourdomain.com/callback
```

These are baked into the build at compile time.

---

## WorkOS Configuration

In the WorkOS dashboard:

1. Add your production callback URL: `https://yourdomain.com/callback`
2. Set the default redirect URI to the production URL
3. Configure any SSO connections for your customers

---

## Autumn Configuration

In the Autumn dashboard:

1. Switch to the production environment
2. Create your products and pricing
3. Copy the live secret key and set it on Convex

---

## DNS and SSL

Your frontend hosting provider handles SSL. Point your domain's DNS records as directed by your provider.

Convex and WorkOS handle their own SSL — no configuration needed.

---

## Checklist

Before going live:

- [ ] `npx convex deploy` completed successfully
- [ ] All production env vars set on Convex deployment
- [ ] Frontend built and deployed with production env vars
- [ ] WorkOS redirect URI updated to production domain
- [ ] `SITE_URL` set to production domain
- [ ] `RESEND_TEST_MODE` set to `false`
- [ ] Autumn live secret key configured
- [ ] Tested sign-in, sign-up, and callback flow on production URL
- [ ] Tested billing checkout on production
