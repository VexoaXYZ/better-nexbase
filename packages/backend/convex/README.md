# Welcome to your Convex functions directory!

Write your Convex functions here.
See https://docs.convex.dev/functions for more.

## Runtime Org Config Control Plane

This project now supports a runtime org config overlay:

- Env defaults (boot-safe):
  - `ORG_ENABLED`
  - `ORG_FEATURE_RBAC_STRICT`
  - `ORG_FEATURE_BILLING_ENFORCEMENT`
  - `ORG_FEATURE_INVITE_EMAILS`
  - `ORG_FEATURE_HARD_LOCKING`
  - `ORG_FEATURE_WORKOS_MIRROR_WRITES`
- Runtime override document in `appConfigs` table (`key = "default"`).
- Accessors live in `convex/lib/config.ts`:
  - `getAppConfig(ctx)`
  - `isOrgEnabled(config)`
  - `isFeatureEnabled(config, feature)`

### Precedence rules

- Env defaults are always loaded first.
- Runtime overrides from `appConfigs` are merged on top.
- Safety lock: if env `ORG_ENABLED=false`, runtime config cannot force-enable org mode.

### Best-practice guardrail modules

- `convex/lib/authz.ts`: centralized user/org capability checks + `OrgContext`.
- `convex/lib/capabilities.ts`: role -> capability map.
- `convex/lib/errors.ts`: typed error code wrapper.

When org mode is disabled, selected non-critical mutations return:

```ts
{ applied: false, reason: "org_disabled", operation: string }
```

Critical operations throw typed errors like:

```txt
[ORG_DISABLED] ...
```

### Mid-project toggle behavior

- Disable -> enable:
  - Existing users stay authenticated.
  - Users without orgs are routed to onboarding when org checks run.
  - Users with memberships continue normally.
- Enable -> disable:
  - Org-dependent non-critical paths no-op or hide in UI.
  - Critical org ops throw typed `ORG_DISABLED` errors.

A query function that takes two arguments looks like:

```ts
// convex/myFunctions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query("tablename").collect();

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second);

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents;
  },
});
```

Using this query function in a React component looks like:

```ts
const data = useQuery(api.myFunctions.myQueryFunction, {
  first: 10,
  second: "hello",
});
```

A mutation function looks like:

```ts
// convex/myFunctions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);

    // Optionally, return a value from your mutation.
    return await ctx.db.get("messages", id);
  },
});
```

Using this mutation function in a React component looks like:

```ts
const mutation = useMutation(api.myFunctions.myMutationFunction);
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: "Hello!", second: "me" });
  // OR
  // use the result once the mutation has completed
  mutation({ first: "Hello!", second: "me" }).then((result) =>
    console.log(result),
  );
}
```

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running `npx convex -h` in your project root
directory. To learn more, launch the docs with `npx convex docs`.
