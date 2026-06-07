export type PredictResponse = {
  label: string;
  confidence: number;
  is_real: boolean;
  all_scores: Record<string, number>;
  mock: boolean;
  created_at: string | null;
  calibration?: Record<string, unknown> | null;
};

export type PredictionHistoryItem = {
  id: string;
  label: string;
  confidence: number;
  is_real: boolean;
  created_at: string;
  image_filename?: string | null;
};

export type PredictionHistoryResponse = {
  items: PredictionHistoryItem[];
  count: number;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

export type PredictSource = "camera" | "upload";

export async function predictImage(
  file: File | Blob,
  source: PredictSource = "upload",
): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append("file", file, file instanceof File ? file.name : "capture.jpg");
  formData.append("source", source);

  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  return parseResponse<PredictResponse>(response);
}

export async function getHistory(): Promise<PredictionHistoryResponse> {
  const response = await fetch(`${API_URL}/history`, {
    method: "GET",
    headers: authHeaders(),
  });

  return parseResponse<PredictionHistoryResponse>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : getFallbackErrorMessage(response.status);
    throw new Error(message);
  }
  return payload as T;
}

function getFallbackErrorMessage(status: number) {
  if (status === 413) {
    return "Ukuran gambar terlalu besar. Gunakan gambar yang lebih kecil.";
  }
  if (status === 415 || status === 400) {
    return "Format file tidak didukung. Gunakan JPG, PNG, atau WebP.";
  }
  return "Tidak dapat terhubung ke server inference. Coba ulangi beberapa saat lagi.";
}

function authHeaders(): HeadersInit {
  if (typeof document === "undefined") {
    return {};
  }

  const token = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("accessToken="))
    ?.split("=")[1];

  return token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {};
}
