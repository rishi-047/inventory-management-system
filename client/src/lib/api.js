const defaultHeaders = {
  "Content-Type": "application/json"
};

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...(options.headers ?? {})
    },
    ...options
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error || "Unexpected request failure.";
    throw new Error(message);
  }

  return payload;
}

export async function login(credentials) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

export async function logout() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

export async function fetchCurrentUser() {
  return apiRequest("/api/auth/me");
}
