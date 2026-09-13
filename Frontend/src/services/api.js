export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getToken = () => localStorage.getItem("token");

export const getAuthHeaders = (includeJson = true) => {
  const token = getToken();
  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(options.body !== undefined),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try { data = await response.json(); } catch {}

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }

  return data;
};

export const idOf = (value) => value?._id ?? value?.id ?? value;
