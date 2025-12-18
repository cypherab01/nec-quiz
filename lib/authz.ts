import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type AppRole = "admin" | "student";

export type SessionUser = {
  userId: string;
  email?: string;
};

/**
 * Server-side helper for API routes: resolves the current session user from a Request.
 * Throws on missing/invalid session.
 */
export async function requireSessionUser(
  request: Request
): Promise<SessionUser> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return { userId: session.user.id, email: session.user.email };
}

/**
 * Server-side helper for API routes: ensures current user is admin.
 * Throws on missing session or non-admin role.
 */
export async function requireAdmin(request: Request): Promise<SessionUser> {
  const user = await requireSessionUser(request);

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.userId },
    select: { role: true },
  });

  if (profile?.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return user;
}
