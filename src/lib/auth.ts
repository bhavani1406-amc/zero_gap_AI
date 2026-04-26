import { useEffect, useState } from "react";

const STORAGE_KEY = "zerogap_user";

export type LocalUser = { id: string; email: string; display_name: string };

function getStoredUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function storeUser(user: LocalUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("zerogap_auth"));
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("zerogap_auth"));
}

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(getStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener("zerogap_auth", handler);
    return () => window.removeEventListener("zerogap_auth", handler);
  }, []);

  return { user, loading, session: user ? { user } : null };
}

export async function logActivity(type: string) {
  const user = getStoredUser();
  if (!user) return;
  const { localDb } = await import("@/lib/local-db");
  localDb.logActivity(user.id, type);
}

export function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = Array.from(new Set(dates)).sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toISOString().slice(0, 10);
  const yStr = yesterday.toISOString().slice(0, 10);
  if (unique[0] !== todayStr && unique[0] !== yStr) return 0;
  let streak = 1;
  let cursor = new Date(unique[0]);
  for (let i = 1; i < unique.length; i++) {
    cursor.setDate(cursor.getDate() - 1);
    if (unique[i] === cursor.toISOString().slice(0, 10)) streak++;
    else break;
  }
  return streak;
}
