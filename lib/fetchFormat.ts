type RequestBody = Record<string, unknown> | undefined;

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type RequestOptions = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  authToken?: string | null;
  body?: RequestBody;
};

function buildHeaders(authToken?: string | null, hasBody = false) {
  const headers: Record<string, string> = {};

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
}

async function readJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    return {
      ok: false,
      error:
        json?.error ??
        json?.message ??
        `Request failed with status ${response.status}`,
    };
  }

  return json as ApiResponse<T>;
}

async function request<T>({
  method,
  url,
  authToken,
  body,
}: RequestOptions): Promise<ApiResponse<T>> {
  const hasBody = body !== undefined;
  const response = await fetch(url, {
    method,
    headers: buildHeaders(authToken, hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  return readJsonResponse<T>(response);
}

export function GET<T>(url: string, authToken?: string | null) {
  return request<T>({
    method: "GET",
    url,
    authToken,
  });
}

export function POST<T>(
  url: string,
  authToken?: string | null,
  body?: RequestBody,
) {
  return request<T>({
    method: "POST",
    url,
    authToken,
    body,
  });
}

export function PATCH<T>(
  url: string,
  authToken?: string | null,
  body?: RequestBody,
) {
  return request<T>({
    method: "PATCH",
    url,
    authToken,
    body,
  });
}

export function DELETE<T>(url: string, authToken?: string | null) {
  return request<T>({
    method: "DELETE",
    url,
    authToken,
  });
}
