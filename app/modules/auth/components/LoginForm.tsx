"use client";

import { useLogin } from "../hooks/useLogin";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const { mutate, isPending } = useLogin();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const email = form.get("email");
    const password = form.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      setError("Invalid form submission");
      return;
    }

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setError(null);

    mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error */}
      {error && (
        <div className="text-sm text-red-300 bg-[var(--card-elevated)] border border-red-400 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1">
        <label className="text-xs text-[var(--text-secondary)]">Email</label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]
                     focus:border-[var(--main-gold)] focus:ring-1 focus:ring-[var(--main-gold)]
                     outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]
                     transition-all duration-200"
        />
      </div>

      {/* Password */}
      <div className="space-y-1 relative">
        <label className="text-xs text-[var(--text-secondary)]">Password</label>

        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]
                     focus:border-[var(--main-gold)] focus:ring-1 focus:ring-[var(--main-gold)]
                     outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]
                     transition-all duration-200"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-[30px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      {/* Login Link */}
      <p className="text-xs text-center text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <a
          href="/register"
          className="text-[var(--main-gold)] hover:underline"
        >
          Sign up
        </a>
      </p>
    </form>
  );
}
