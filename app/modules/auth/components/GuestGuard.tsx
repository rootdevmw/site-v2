"use client";

import { useAuthStore } from "../store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && user) {
      router.replace("/dashboard");
    }
  }, [initialized, user]);

  if (!initialized) {
    return <SpiritualLoader message="Checking your session..." />;
  }

  if (user) return null;

  return children;
}
