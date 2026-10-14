
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check whether your server is running."
    );
  }

  const text = await response.text();

  let data: unknown;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      message = data.message;
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    throw new Error(message);
  }

  return data as T;
}
