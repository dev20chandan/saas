'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

export default function PageTracker() {
  const pathname = usePathname();
  const { user, userType } = useAuth();

  useEffect(() => {
    // Only track if we have a user and a pathname
    if (user && pathname) {
      const emailOrName = user.email || user.name || 'Unknown User';
      const role = user.role || userType || 'User';
      
      api.post('/audit', {
        user: emailOrName,
        role: role,
        action: 'PAGE_VIEW',
        resource: pathname,
        status: 'Success',
        ipAddress: 'Client Device', // A real app would get IP from backend
        payload: { path: pathname, timestamp: new Date().toISOString() }
      }).catch(err => {
        console.error('Failed to log page visit:', err);
      });
    }
  }, [pathname, user, userType]);

  return null;
}
