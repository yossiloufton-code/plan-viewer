const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export function getApiBase() {
  return API_BASE;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export async function putBinary(url: string, file: File) {
  const isAbs = /^https?:\/\//i.test(url);
  const full = isAbs ? url : `${API_BASE}${url}`;

  const res = await fetch(full, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Binary PUT failed: ${res.status}`);
  }
}
