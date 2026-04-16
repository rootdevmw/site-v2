"use client";

import { useEffect } from "react";
import { getMe } from "../api/me";
import { useAuthStore } from "../store/auth.store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    async function init() {
      try {
        const res = await getMe();

        if (res.success) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }

    init();
  }, []);

  return children;
}
