import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./errors";
import { fail } from "./response";

// Overload for handlers with params (dynamic routes)
export function withErrorHandling<T extends { [key: string]: string }>(
  handler: (
    req: NextRequest,
    context: { params: Promise<T> }
  ) => Promise<NextResponse>
): (req: NextRequest, context: { params: Promise<T> }) => Promise<NextResponse>;

// Overload for handlers without params (static routes)
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse>;

// Implementation
export function withErrorHandling(
  handler:
    | ((req: NextRequest) => Promise<NextResponse>)
    | ((
        req: NextRequest,
        context: { params: Promise<{ [key: string]: string }> }
      ) => Promise<NextResponse>)
) {
  return async (
    req: NextRequest,
    context?: { params: Promise<{ [key: string]: string }> }
  ) => {
    try {
      if (context) {
        return await (
          handler as (
            req: NextRequest,
            context: { params: Promise<{ [key: string]: string }> }
          ) => Promise<NextResponse>
        )(req, context);
      } else {
        return await (handler as (req: NextRequest) => Promise<NextResponse>)(
          req
        );
      }
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
