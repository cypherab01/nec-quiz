import { createAuthClient } from "better-auth/react";

/**
 * Better Auth React client.
 *
 * Defaults to the same-origin Next.js auth route base (`/api/auth`), so this works
 * for both local dev and deployments without extra configuration.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
