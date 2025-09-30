import { API_BASE_URL } from "@/lib/config";

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    credentials: 'include',
    cache: "no-store",
  });

  if (!res.ok) {
    let errorMessage = '';
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || '';
    } catch (_) {}
    throw new Error(`API error ${res.status} at ${path} → ${errorMessage}`);
  }

  return res;
}