import { createClerkClient, ClerkClient } from "npm:@clerk/backend";
import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import type { RequestState } from "npm:@clerk/backend/dist/tokens/authStatus";

/**
 * an instance of the clerk client to interact with clerk for verification
 * for protected routes
 * @author Sriram Sundar
 *
 * @type {ClerkClient}
 */
const clerkClient: ClerkClient = createClerkClient({
  secretKey: Deno.env.get("CLERK_SECRET_KEY") || "",
  publishableKey: Deno.env.get("CLERK_PUBLISHABLE_KEY") || "",
});

/**
 * the list of authorized parties that are allowed to access the protected routes
 * @author Sriram Sundar
 *
 * @type {string[]}
 */
const authorizedParties: string[] = [Deno.env.get("FRONT_ORIGIN") as string];

/**
 * middleware to verify the user session and user id using clerk
 * and verify authentication status for protected routes
 * @author Sriram Sundar
 *
 * @async
 * @param {Context} ctx
 * @param {() => Promise<unknown>} next
 * @returns {Promise<unknown>) => any}
 */
export const clerkAuthMiddleware = async (
  ctx: Context,
  next: () => Promise<unknown>
) => {
  const req = new Request(ctx.request.url.toString(), {
    method: ctx.request.method,
    headers: ctx.request.headers,
  });

  const authState: RequestState = await clerkClient.authenticateRequest(req, {
    jwtKey: Deno.env.get("CLERK_JWT_KEY") || "",
    authorizedParties,
  });

  console.log("Clerk Auth Response:", authState);

  if (!authState.isSignedIn) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Not signed in" };
    return;
  }

  ctx.state.sessionId = authState.sessionId || "";
  ctx.state.userId = authState.userId || "";

  await next();
};

export default clerkAuthMiddleware;
