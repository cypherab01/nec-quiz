import { ApiError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
});

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();

  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError(
      "Invalid request body",
      422,
      "VALIDATION_ERROR",
      z.treeifyError(parsed.error)
    );
  }

  const user = await createUser(parsed.data);

  return ok(user, "User created", 201);
});

const createUser = async (data: z.infer<typeof createUserSchema>) => {
  return {
    id: "1",
    name: data.name,
    email: data.email,
  };
};
