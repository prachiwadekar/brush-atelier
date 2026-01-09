'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { identifyUser } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Identify user when they're authenticated
    if (status === 'authenticated' && session?.user?.id) {
      identifyUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [session, status]);

  return <>{children}</>;
}
