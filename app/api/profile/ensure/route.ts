import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/authz";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let userId: string;
  try {
    const sessionUser = await requireSessionUser(request);
    userId = sessionUser.userId;
  } catch {
    return jsonError(401, "UNAUTHORIZED", "Login required.");
  }

  const existing = await prisma.userProfile.findUnique({
    where: { userId },
    select: { role: true },
  });

  if (existing) {
    return Response.json({ ok: true, data: { role: existing.role } });
  }

  const created = await prisma.userProfile.create({
    data: { userId, role: "student" },
    select: { role: true },
  });

  return Response.json({ ok: true, data: { role: created.role } });
}
