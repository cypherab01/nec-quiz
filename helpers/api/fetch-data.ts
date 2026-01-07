"use server";

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

export async function fetchData<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Cookie: (await cookies()).toString(),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // 204 No Content
    if (res.status === 204) {
      return null;
    }

    const contentType = res.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    // ❌ Not OK → try to throw JSON error
    if (!res.ok) {
      if (isJson) {
        const errorBody = await res.json();
        throw errorBody; // <-- important
      }
      return null;
    }

    // ✅ OK but not JSON
    if (!isJson) {
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    throw error;
  }
}
