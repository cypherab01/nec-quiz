import { auth } from "@/lib/auth";
import { ApiError } from "@/helpers/api/errors";

export async function requireSession(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  return session;
}

export function requireAdmin(session: any) {
  if (session.roles !== "admin") {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
}
