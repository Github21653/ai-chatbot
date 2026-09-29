const API = process.env.NEXT_PUBLIC_API_URL!;

export type Role = "user" | "superadmin";
export interface User { id: number; username: string; role: Role; }

export async function getMe(): Promise<User> {
  const r = await fetch(`${API}/api/auth/me`, { credentials: "include" });
  if (!r.ok) throw new Error("Not authenticated");
  return r.json();
}

export async function login(username: string, password: string): Promise<User> {
  const r = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return r.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function registerUser(
  username: string, password: string, role: Role,
): Promise<User> {
  const r = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return r.json();
}