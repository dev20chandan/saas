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
  type: 'admin' | 'user';
  schoolId: string;
  permissions: ModulePermissions;
  isReady: boolean;
  signIn: (payload: { token: string; role: AdminRole; type?: 'admin' | 'user'; schoolId?: string; permissions?: ModulePermissions }) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  role: DEFAULT_ROLE,
  type: 'admin',
  schoolId: "",
  permissions: getDefaultPermissions(DEFAULT_ROLE),
  isReady: false,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole>(DEFAULT_ROLE);
  const [type, setType] = useState<'admin' | 'user'>('admin');
  const [schoolId, setSchoolId] = useState("");
  const [permissions, setPermissions] = useState<ModulePermissions>(getDefaultPermissions(DEFAULT_ROLE));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const nextToken = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const nextRole = normalizeRole(localStorage.getItem(AUTH_STORAGE_KEYS.role));
    const nextType = (localStorage.getItem(AUTH_STORAGE_KEYS.type) as 'admin' | 'user') || 'admin';
    const nextSchoolId = localStorage.getItem(AUTH_STORAGE_KEYS.schoolId) ?? "";
    const storedPermissions = localStorage.getItem(AUTH_STORAGE_KEYS.permissions);

    const timeoutId = window.setTimeout(() => {
      setToken(nextToken);
      setRole(nextRole);
      setType(nextType);
      setSchoolId(nextSchoolId);
      setPermissions(parsePermissions(storedPermissions) ?? getDefaultPermissions(nextRole));
      setIsReady(true);
    }, 0);

    // Listen for global unauthorized events from the api client
    const handleUnauthorized = () => {
      signOut();
      // Optionally redirect to login page here, e.g. window.location.href = '/login';
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  function signIn({
    token: nextToken,
    role: nextRole,
    type: nextType = 'admin',
    schoolId: nextSchoolId = "",
    permissions: nextPermissions,
  }: { token: string; role: AdminRole; type?: 'admin' | 'user'; schoolId?: string; permissions?: ModulePermissions }) {
    localStorage.setItem(AUTH_STORAGE_KEYS.token, nextToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.role, nextRole);
    localStorage.setItem(AUTH_STORAGE_KEYS.type, nextType);
    if (nextSchoolId) {
      localStorage.setItem(AUTH_STORAGE_KEYS.schoolId, nextSchoolId);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.schoolId);
    }
    const storedPermissions = nextPermissions ?? getDefaultPermissions(nextRole);
    localStorage.setItem(AUTH_STORAGE_KEYS.permissions, JSON.stringify(storedPermissions));

    setToken(nextToken);
    setRole(nextRole);
    setType(nextType);
    setSchoolId(nextSchoolId);
    setPermissions(storedPermissions);
    setIsReady(true);
  }

  function signOut() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.role);
    localStorage.removeItem(AUTH_STORAGE_KEYS.type);
    localStorage.removeItem(AUTH_STORAGE_KEYS.schoolId);
    localStorage.removeItem(AUTH_STORAGE_KEYS.permissions);
    setToken(null);
    setRole(DEFAULT_ROLE);
    setType('admin');
    setSchoolId("");
    setPermissions(getDefaultPermissions(DEFAULT_ROLE));
    setIsReady(true);
  }

  return (
    <AuthContext.Provider value={{ token, role, type, schoolId, permissions, isReady, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
