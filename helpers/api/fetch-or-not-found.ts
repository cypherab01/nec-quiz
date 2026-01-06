"use server";

import { notFound } from "next/navigation";
import { fetchData } from "./fetch-data";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

/**
 * Fetch API data and throw 404 if missing or failed
 */
export async function fetchOrNotFound<T>(path: string): Promise<T> {
  const res = await fetchData<ApiResponse<T>>(path);

  if (!res || res.success !== true || !res.data) {
    notFound();
  }

  return res.data;
}
