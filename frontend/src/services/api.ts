import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_TOKEN_KEY = "PATHFINDER_AUTH_TOKEN";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

export const API_BASE_URL = env?.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";
export const API_MODE = env?.EXPO_PUBLIC_API_MODE || "mock";
export const USE_BACKEND_API = API_MODE === "backend";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function getStoredToken() {
  return AsyncStorage.getItem(API_TOKEN_KEY);
}

export async function setStoredToken(token: string) {
  await AsyncStorage.setItem(API_TOKEN_KEY, token);
}

export async function clearStoredToken() {
  await AsyncStorage.removeItem(API_TOKEN_KEY);
}

export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = options.auth === false ? null : await getStoredToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined)
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.error ||
      payload?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
