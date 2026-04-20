"use client";

import { SpiritualLoader } from "@/components/ui/SpiritualLoader";
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading)
    return (
      <SpiritualLoader message=" “Be still, and know that I am God.” – Psalm 46:10" />
    );

  if (!user) return null;

  return children;
}
