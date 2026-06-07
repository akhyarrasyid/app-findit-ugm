const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

type AuthActionResult =
  | { ok: true; data?: Record<string, unknown> }
  | { ok: false; message: string };

type LoginInput = {
  username: string;
  password: string;
};

export async function loginWithPassword({
  username,
  password,
}: LoginInput): Promise<AuthActionResult> {
  const formData = new URLSearchParams();
  formData.set("username", username);
  formData.set("password", password);

  const response = await fetch(`${API_URL}/auth/jwt/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
    cache: "no-store",
  });

  const payload = await parseJson(response);
  if (!response.ok) {
    return { ok: false, message: getAuthErrorMessage(payload, response.status) };
  }

  return { ok: true, data: payload ?? undefined };
}

export async function registerUser(input: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const payload = await parseJson(response);
  if (!response.ok) {
    return { ok: false, message: getAuthErrorMessage(payload, response.status) };
  }

  return { ok: true, data: payload ?? undefined };
}

export async function requestPasswordReset(email: string): Promise<AuthActionResult> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });

  const payload = await parseJson(response);
  if (!response.ok) {
    return { ok: false, message: getAuthErrorMessage(payload, response.status) };
  }

  return { ok: true, data: payload ?? undefined };
}

export async function confirmPasswordReset(input: {
  token: string;
  password: string;
}): Promise<AuthActionResult> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const payload = await parseJson(response);
  if (!response.ok) {
    return { ok: false, message: getAuthErrorMessage(payload, response.status) };
  }

  return { ok: true, data: payload ?? undefined };
}

export async function logoutCurrentUser(token?: string): Promise<void> {
  if (token) {
    await fetch(`${API_URL}/auth/jwt/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }).catch(() => undefined);
  }
}

export async function validateCurrentUser(token: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return response.ok;
}

async function parseJson(response: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getAuthErrorMessage(
  payload: Record<string, unknown> | null,
  status: number,
): string {
  const detail = payload?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object") {
    if ("reason" in detail) {
      const reason = detail.reason;
      if (Array.isArray(reason)) {
        return reason.join(" ");
      }
      if (typeof reason === "string") {
        return reason;
      }
    }

    if ("message" in detail && typeof detail.message === "string") {
      return detail.message;
    }
  }

  if (status === 401) {
    return "Email atau password tidak sesuai.";
  }

  return "Terjadi kesalahan saat memproses permintaan. Coba lagi.";
}
