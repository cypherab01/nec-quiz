import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import prisma from "@/lib/prisma";

export const GET = withErrorHandling(async (req) => {
  const subjects = await prisma.subject.findMany();
  return ok(subjects, "Subjects fetched", 200);
});
