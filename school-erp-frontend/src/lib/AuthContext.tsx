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
import { api } from "./api";

interface AuthContextValue {
  token: string | null;
  role: AdminRole;
  type: 'admin' | 'user';
  schoolId: string;
  permissions: ModulePermissions;
  isReady: boolean;
  isImpersonating: boolean;
  schoolColor: string;
  isCoaching: boolean;
  setSchoolColor: (color: string) => void;
  signIn: (payload: { token: string; role: AdminRole; type?: 'admin' | 'user'; schoolId?: string; permissions?: ModulePermissions }) => void;
  signOut: () => void;
  impersonateSchool: (payload: { token: string; role: AdminRole; schoolId: string; permissions?: ModulePermissions }) => void;
  stopImpersonating: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  role: DEFAULT_ROLE,
  type: 'admin',
  schoolId: "",
  permissions: getDefaultPermissions(DEFAULT_ROLE),
  isReady: false,
  isImpersonating: false,
  schoolColor: "#10b981",
  isCoaching: false,
  setSchoolColor: () => {},
  signIn: () => {},
  signOut: () => {},
  impersonateSchool: () => {},
  stopImpersonating: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole>(DEFAULT_ROLE);
  const [type, setType] = useState<'admin' | 'user'>('admin');
  const [schoolId, setSchoolId] = useState("");
  const [permissions, setPermissions] = useState<ModulePermissions>(getDefaultPermissions(DEFAULT_ROLE));
  const [isReady, setIsReady] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [schoolColor, setSchoolColor] = useState("#10b981");
  const [isCoaching, setIsCoaching] = useState(false);

  useEffect(() => {
    const nextToken = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const nextRole = normalizeRole(localStorage.getItem(AUTH_STORAGE_KEYS.role));
    const nextType = (localStorage.getItem(AUTH_STORAGE_KEYS.type) as 'admin' | 'user') || 'admin';
    const nextSchoolId = localStorage.getItem(AUTH_STORAGE_KEYS.schoolId) ?? "";
    const storedPermissions = localStorage.getItem(AUTH_STORAGE_KEYS.permissions);
    const hasParentToken = !!localStorage.getItem("systemAdminToken");
    const cachedColor = nextSchoolId ? localStorage.getItem(`school_theme_${nextSchoolId}`) : null;
    const cachedCoaching = nextSchoolId ? localStorage.getItem(`school_is_coaching_${nextSchoolId}`) === 'true' : false;

    const timeoutId = window.setTimeout(() => {
      setToken(nextToken);
      setRole(nextRole);
      setType(nextType);
      setSchoolId(nextSchoolId);
      setPermissions(parsePermissions(storedPermissions) ?? getDefaultPermissions(nextRole));
      setIsImpersonating(hasParentToken);
      setIsCoaching(cachedCoaching);
      if (cachedColor) {
        setSchoolColor(cachedColor);
      }
      setIsReady(true);
    }, 0);

    // Listen for global unauthorized events from the api client
    const handleUnauthorized = () => {
      signOut();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Hydrate and fetch school theme color from DB
  useEffect(() => {
    if (!schoolId) {
      setSchoolColor("#10b981");
      setIsCoaching(false);
      return;
    }

    api.get(`/schools/${schoolId}`)
      .then((res) => {
        if (res) {
          if (res.themeColor) {
            setSchoolColor(res.themeColor);
            localStorage.setItem(`school_theme_${schoolId}`, res.themeColor);
          }
          const coachingVal = !!res.isCoaching;
          setIsCoaching(coachingVal);
          localStorage.setItem(`school_is_coaching_${schoolId}`, String(coachingVal));
        }
      })
      .catch((e) => console.error("Error loading theme color inside AuthContext:", e));
  }, [schoolId]);

  function handleSetSchoolColor(color: string) {
    setSchoolColor(color);
    if (schoolId) {
      localStorage.setItem(`school_theme_${schoolId}`, color);
    }
  }

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
    
    // Fallback load of school theme immediately upon login if cached
    if (nextSchoolId) {
      const cachedColor = localStorage.getItem(`school_theme_${nextSchoolId}`);
      if (cachedColor) {
        setSchoolColor(cachedColor);
      }
    }
    setIsReady(true);
  }

  function impersonateSchool({
    token: schoolToken,
    role: schoolRole,
    schoolId: schoolIdValue,
    permissions: schoolPermissions,
  }: { token: string; role: AdminRole; schoolId: string; permissions?: ModulePermissions }) {
    const currentToken = localStorage.getItem(AUTH_STORAGE_KEYS.token) ?? "";
    const currentRole = localStorage.getItem(AUTH_STORAGE_KEYS.role) ?? "";
    const currentType = localStorage.getItem(AUTH_STORAGE_KEYS.type) ?? "";
    const currentPermissions = localStorage.getItem(AUTH_STORAGE_KEYS.permissions) ?? "";

    localStorage.setItem("systemAdminToken", currentToken);
    localStorage.setItem("systemAdminRole", currentRole);
    localStorage.setItem("systemAdminType", currentType);
    localStorage.setItem("systemAdminPermissions", currentPermissions);

    // Warm up the cached state if we have it
    const cachedColor = localStorage.getItem(`school_theme_${schoolIdValue}`);
    if (cachedColor) {
      setSchoolColor(cachedColor);
    }

    signIn({
      token: schoolToken,
      role: schoolRole,
      type: 'user',
      schoolId: schoolIdValue,
      permissions: schoolPermissions,
    });
    setIsImpersonating(true);
  }

  function stopImpersonating() {
    const parentToken = localStorage.getItem("systemAdminToken");
    const parentRole = normalizeRole(localStorage.getItem("systemAdminRole"));
    const parentType = (localStorage.getItem("systemAdminType") as 'admin' | 'user') || 'admin';
    const parentPermissions = parsePermissions(localStorage.getItem("systemAdminPermissions")) ?? getDefaultPermissions(parentRole);

    localStorage.removeItem("systemAdminToken");
    localStorage.removeItem("systemAdminRole");
    localStorage.removeItem("systemAdminType");
    localStorage.removeItem("systemAdminPermissions");

    signIn({
      token: parentToken || "",
      role: parentRole,
      type: parentType,
      schoolId: "",
      permissions: parentPermissions,
    });
    setIsImpersonating(false);
  }

  function signOut() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.role);
    localStorage.removeItem(AUTH_STORAGE_KEYS.type);
    localStorage.removeItem(AUTH_STORAGE_KEYS.schoolId);
    localStorage.removeItem(AUTH_STORAGE_KEYS.permissions);
    
    // Also clean up impersonation tracking keys
    localStorage.removeItem("systemAdminToken");
    localStorage.removeItem("systemAdminRole");
    localStorage.removeItem("systemAdminType");
    localStorage.removeItem("systemAdminPermissions");

    setToken(null);
    setRole(DEFAULT_ROLE);
    setType('admin');
    setSchoolId("");
    setPermissions(getDefaultPermissions(DEFAULT_ROLE));
    setSchoolColor("#10b981");
    setIsCoaching(false);
    setIsImpersonating(false);
    setIsReady(true);
  }

  return (
    <AuthContext.Provider value={{ token, role, type, schoolId, permissions, isReady, isImpersonating, schoolColor, isCoaching, setSchoolColor: handleSetSchoolColor, signIn, signOut, impersonateSchool, stopImpersonating }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
