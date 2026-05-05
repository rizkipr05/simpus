function normalizeUrl(value) {
  return value ? value.replace(/\/+$/, "") : "";
}

function isLoopbackHost(hostname) {
  return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname);
}

function shouldIgnoreConfiguredUrl(value) {
  if (typeof window === "undefined" || !value || isLoopbackHost(window.location.hostname)) {
    return false;
  }

  try {
    return isLoopbackHost(new URL(value).hostname);
  } catch {
    return false;
  }
}

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:4000/api";
  }

  const { protocol, hostname, origin } = window.location;
  if (isLoopbackHost(hostname)) {
    return `${protocol}//${hostname}:4000/api`;
  }

  return `${origin}/api`;
}

const configuredApiBaseUrl = normalizeUrl(import.meta.env.VITE_API_BASE_URL || "");
const API_BASE_URL =
  configuredApiBaseUrl && !shouldIgnoreConfiguredUrl(configuredApiBaseUrl)
    ? configuredApiBaseUrl
    : getDefaultApiBaseUrl();

export async function loginRequest(payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    error.isNetworkError = true;
    throw error;
  }

  if (!response.ok) {
    let message = "Login gagal. Periksa username dan password.";

    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Gunakan pesan default jika body response bukan JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function healthCheckRequest() {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
  } catch (error) {
    error.isNetworkError = true;
    throw error;
  }

  if (!response.ok) {
    throw new Error("Backend tidak merespons normal.");
  }

  return response.json();
}

export { API_BASE_URL };
