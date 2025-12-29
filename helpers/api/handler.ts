import { NextResponse } from "next/server";
import { ApiError } from "./errors";
import { fail } from "./response";

export function withErrorHandling(
  handler: (req: Request) => Promise<NextResponse>
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      // Known errors
      if (error instanceof ApiError) {
        return fail(error.message, error.status, error.code, error.details);
      }

      // Unexpected errors (log these!)
      console.error("API Error:", error);

      return fail("Something went wrong", 500, "INTERNAL_SERVER_ERROR");
    }
  };
}
