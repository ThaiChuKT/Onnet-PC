import axios, { AxiosError } from "axios";
import { clearAccessToken, getAccessToken } from "./authStorage";
import { ApiError, type ApiResponse } from "./types";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const http = axios.create({
  baseURL,
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        clearAccessToken();
        // Best-effort redirect; router guards will also catch.
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    }
    return Promise.reject(error);
  },
);

function messageFromAxiosError(err: AxiosError<unknown>): string {
  const maybeData = err.response?.data as { message?: unknown } | undefined;
  const apiMessage = maybeData?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage;
  if (err.message) return err.message;
  return "Request failed";
}

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const res = await http.get<ApiResponse<T>>(path, { params });
    if (!res.data.success) throw new ApiError(res.data.message ?? "Request failed", { status: res.status });
    return res.data.data as T;
  } catch (e) {
    if (axios.isAxiosError(e)) throw new ApiError(messageFromAxiosError(e), { status: e.response?.status });
    throw e;
  }
}

export async function apiPost<T, B = unknown>(path: string, body?: B): Promise<T> {
  try {
    const res = await http.post<ApiResponse<T>>(path, body);
    if (!res.data.success) throw new ApiError(res.data.message ?? "Request failed", { status: res.status });
    return res.data.data as T;
  } catch (e) {
    if (axios.isAxiosError(e)) throw new ApiError(messageFromAxiosError(e), { status: e.response?.status });
    throw e;
  }
}

export async function apiPatch<T, B = unknown>(path: string, body?: B): Promise<T> {
  try {
    const res = await http.patch<ApiResponse<T>>(path, body);
    if (!res.data.success) throw new ApiError(res.data.message ?? "Request failed", { status: res.status });
    return res.data.data as T;
  } catch (e) {
    if (axios.isAxiosError(e)) throw new ApiError(messageFromAxiosError(e), { status: e.response?.status });
    throw e;
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  try {
    const res = await http.delete<ApiResponse<T>>(path);
    if (!res.data.success) throw new ApiError(res.data.message ?? "Request failed", { status: res.status });
    return res.data.data as T;
  } catch (e) {
    if (axios.isAxiosError(e)) throw new ApiError(messageFromAxiosError(e), { status: e.response?.status });
    throw e;
  }
}

