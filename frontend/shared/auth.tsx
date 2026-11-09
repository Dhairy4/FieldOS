"use client";

import * as React from "react";
import { useEffect } from "react";
import { authApi } from "./api";
import type { User } from "./types";

const TOKEN_KEY = "fieldos_token";
const USER_KEY = "fieldos_user";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string,
    languagePreference?: string
  ) => Promise<void>;
  logout: () => void;
  setAuth: (token: string, user: User) => void;
}

const AuthContext = React.createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Start with isLoading: true on both server and client so the
  // initial render matches (no hydration mismatch). localStorage is
  // read inside useEffect which only runs on the client.
  const [state, setState] = React.useState<{
    token: string | null;
    user: User | null;
    isLoading: boolean;
  }>({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      let user: User | null = null;
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        user = JSON.parse(raw) as User;
      }
      setState({ token, user, isLoading: false });
    } catch {
      setState({ token: null, user: null, isLoading: false });
    }
  }, []);

  const isAuthenticated = !!state.token && !state.isLoading;

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await authApi.login({ email, password });
      const token = res.token;
      const user = res.user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ token, user, isLoading: false });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role = "technician",
    languagePreference = "english"
  ) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await authApi.register({
        name,
        email,
        password,
        role: role as "technician" | "supervisor",
        languagePreference,
      });
      const token = res.token;
      const user = res.user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ token, user, isLoading: false });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null, isLoading: false });
  };

  const setAuth = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState({ token, user, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, isAuthenticated, login, register, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.displayName = "AuthProvider";
