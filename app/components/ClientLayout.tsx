'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      {!isLoginPage && <Navbar />}
      {children}
    </>
  );
}
