import { create } from "zustand";
import { getToken, setToken, clearToken } from "./api";

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  user: null,
  setAuth: (token, user) => {
    setToken(token);
    set({ token, user });
  },
  logout: () => {
    clearToken();
    set({ token: null, user: null });
  },
}));
