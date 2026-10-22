"use client";
import { useEffect } from "react";
import { getMe } from "../api/me";
import { useAuthStore } from "../store/auth.store";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const controller = new AbortController(),
      version = useAuthStore.getState().sessionVersion;
    let active = true;
    async function initialize() {
      try {
        const result = await getMe(true, controller.signal);
        if (active && useAuthStore.getState().sessionVersion === version)
          useAuthStore.getState().setUser(result.data);
      } catch {
        if (active && useAuthStore.getState().sessionVersion === version)
          useAuthStore.getState().setUser(null);
      } finally {
        if (active) {
          useAuthStore.getState().setLoading(false);
          useAuthStore.getState().setInitialized(true);
        }
      }
    }
    void initialize();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);
  return children;
}
