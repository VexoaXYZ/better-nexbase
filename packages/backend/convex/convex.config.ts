import resend from "@convex-dev/resend/convex.config";
import stripe from "@convex-dev/stripe/convex.config.js";
import workOSAuthKit from "@convex-dev/workos-authkit/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(stripe);
app.use(resend);
app.use(workOSAuthKit);

export default app;
