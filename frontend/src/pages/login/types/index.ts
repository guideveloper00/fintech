import type { ReactNode } from 'react';

// ─── AuthPageWrapper ──────────────────────────────────────────────────────────

export interface AuthPageWrapperProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  error?: ReactNode;
}
