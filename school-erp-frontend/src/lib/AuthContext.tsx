'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  AUTH_STORAGE_KEYS,
  DEFAULT_ROLE,
  getDefaultPermissions,
  normalizeRole,
  parsePermissions,
  type AdminRole,
  type ModulePermissions,
} from "./auth";

interface AuthContextValue {
  token: string | null;
  role: AdminRole;
  schoolId: string;
  permissions: ModulePermissions;
  isReady: boolean;
  signIn: (payload: { token: string; role: AdminRole; schoolId?: string; permissions?: ModulePermissions }) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  role: DEFAULT_ROLE,
  schoolId: "",
  permissions: getDefaultPermissions(DEFAULT_ROLE),
  isReady: false,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole>(DEFAULT_ROLE);
  const [schoolId, setSchoolId] = useState("");
  const [permissions, setPermissions] = useState<ModulePermissions>(getDefaultPermissions(DEFAULT_ROLE));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const nextToken = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const nextRole = normalizeRole(localStorage.getItem(AUTH_STORAGE_KEYS.role));
    const nextSchoolId = localStorage.getItem(AUTH_STORAGE_KEYS.schoolId) ?? "";
    const storedPermissions = localStorage.getItem(AUTH_STORAGE_KEYS.permissions);

    const timeoutId = window.setTimeout(() => {
      setToken(nextToken);
      setRole(nextRole);
      setSchoolId(nextSchoolId);
      setPermissions(parsePermissions(storedPermissions) ?? getDefaultPermissions(nextRole));
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function signIn({
    token: nextToken,
    role: nextRole,
    schoolId: nextSchoolId = "",
    permissions: nextPermissions,
  }: { token: string; role: AdminRole; schoolId?: string; permissions?: ModulePermissions }) {
    localStorage.setItem(AUTH_STORAGE_KEYS.token, nextToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.role, nextRole);
    if (nextSchoolId) {
      localStorage.setItem(AUTH_STORAGE_KEYS.schoolId, nextSchoolId);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.schoolId);
    }
    const storedPermissions = nextPermissions ?? getDefaultPermissions(nextRole);
    localStorage.setItem(AUTH_STORAGE_KEYS.permissions, JSON.stringify(storedPermissions));

    setToken(nextToken);
    setRole(nextRole);
    setSchoolId(nextSchoolId);
    setPermissions(storedPermissions);
    setIsReady(true);
  }

  function signOut() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.role);
    localStorage.removeItem(AUTH_STORAGE_KEYS.schoolId);
    localStorage.removeItem(AUTH_STORAGE_KEYS.permissions);
    setToken(null);
    setRole(DEFAULT_ROLE);
    setSchoolId("");
    setPermissions(getDefaultPermissions(DEFAULT_ROLE));
    setIsReady(true);
  }

  return (
    <AuthContext.Provider value={{ token, role, schoolId, permissions, isReady, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
