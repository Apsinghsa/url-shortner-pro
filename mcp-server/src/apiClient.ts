const API_BASE = process.env.SHORTENER_API_BASE ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  const text = await res.text();
  let body: unknown = undefined;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : null) ?? `Request failed with ${res.status}`;
    throw new ApiError(res.status, body, message);
  }

  return body as T;
}

export interface ShortenResponse {
  success: boolean;
  message: string;
  data?: { url: ShortUrl };
}

export interface ShortUrl {
  _id: string;
  urlCode: string;
  longUrl: string;
  shortUrl: string;
  clickCount: number;
  date: string;
  user?: string | null;
}

export interface MyLinksResponse {
  success: boolean;
  count: number;
  data: ShortUrl[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}

export function registerUser(input: {
  name?: string;
  email: string;
  password: string;
}) {
  return request<{ success: boolean; message: string }>(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function loginUser(input: { email: string; password: string }) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function shortenUrl(longUrl: string, token?: string) {
  return request<ShortenResponse>("/api/shorten", {
    method: "POST",
    body: JSON.stringify({ longUrl }),
    token,
  });
}

export function getMyLinks(token: string) {
  return request<MyLinksResponse>("/api/links/my-links", { token });
}
