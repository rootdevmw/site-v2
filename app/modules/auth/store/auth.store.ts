import { create } from "zustand";

type User = {
  id: string;
  email: string;
  roles: string[];
};

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  sessionVersion: number;
  notice: "password-changed" | "password-uncertain" | null;
  setNotice: (notice: "password-changed" | "password-uncertain" | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (val: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  sessionVersion: 0,
  notice: null,
  setNotice: (notice) => set({ notice }),

  setUser: (user) =>
    set((state) => ({ user, sessionVersion: state.sessionVersion + 1 })),
  setLoading: (loading) => set({ loading }),
  setInitialized: (val) => set({ initialized: val }),
}));
