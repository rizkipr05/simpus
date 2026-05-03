const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

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

export { API_BASE_URL };
