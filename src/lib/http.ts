import type { NextRequest } from "next/server";

export async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function queryValue(request: NextRequest, key: string) {
  return request.nextUrl.searchParams.get(key)?.trim() ?? "";
}

export function positiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
