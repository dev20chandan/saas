'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

function decodeToken(token: string | null) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function PageTracker() {
  const pathname = usePathname();
  const { token, role: contextRole } = useAuth();

  useEffect(() => {
    if (token && pathname) {
      const decoded = decodeToken(token);
      if (decoded) {
        const emailOrName = decoded.email || decoded.name || 'Unknown User';
        const role = decoded.role || contextRole || 'User';

        api.post('/audit', {
          user: emailOrName,
          role: role,
          action: 'PAGE_VIEW',
          resource: pathname,
          status: 'Success',
          ipAddress: 'Client Device',
          payload: { path: pathname, timestamp: new Date().toISOString() }
        }).catch(err => {
          console.error('Failed to log page visit:', err);
        });
      }
    }
  }, [pathname, token, contextRole]);

  return null;
}
