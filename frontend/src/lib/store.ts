import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("dspm_token") : null,
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem("dspm_token", token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("dspm_token");
    set({ token: null, user: null });
  },
}));
