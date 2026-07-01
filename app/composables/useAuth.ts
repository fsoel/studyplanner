export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
}

/**
 * Authentication state + actions. In `local` storage mode this is a no-op
 * stub that reports the user as always authenticated (no login required).
 */
export function useAuth() {
  const isBackend = useRuntimeConfig().public.storageMode !== "local";
  const user = useState<AuthUser | null>("auth-user", () => null);
  const ready = useState<boolean>("auth-ready", () => false);

  async function fetchMe(): Promise<boolean> {
    if (!isBackend) {
      user.value = { id: "local", email: null, name: null };
      ready.value = true;
      return true;
    }
    try {
      const me = await $fetch<{ user: AuthUser; activePlanId: string | null }>(
        "/api/me",
      );
      user.value = me.user;
      return true;
    } catch {
      user.value = null;
      return false;
    } finally {
      ready.value = true;
    }
  }

  function login(): void {
    window.location.href = "/auth/login";
  }

  async function logout(): Promise<void> {
    if (isBackend) {
      await $fetch("/auth/logout", { method: "POST" }).catch(() => {});
    }
    user.value = null;
    window.location.href = "/";
  }

  const isAuthenticated = computed(() => (isBackend ? !!user.value : true));

  return { user, ready, isBackend, isAuthenticated, fetchMe, login, logout };
}
