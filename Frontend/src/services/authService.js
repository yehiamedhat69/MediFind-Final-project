import { request } from "./api";

export const login = async (email, password) => {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

export const register = async ({ name, email, password, role }) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    }),
  });
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = async () => {
  const data = await request("/users/me");
  const user = data.user;
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const updateCurrentUser = async (updates) => {
  const data = await request("/users/me", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
};
