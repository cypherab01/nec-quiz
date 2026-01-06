"use server";

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

/**
 * Generic server fetcher
 * Returns API response as-is (T = API envelope)
 */
export async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Cookie: (await cookies()).toString(),
      },
    });

    if (!res.ok || res.status === 204) {
      return null;
    }

    return (await res.json()) as T;
  } catch {
    return null;
  }
}
