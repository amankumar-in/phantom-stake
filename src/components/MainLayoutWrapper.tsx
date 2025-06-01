"use client";

import { usePathname } from 'next/navigation';
import { Header } from "@/components/Header";
import React from 'react';

interface MainLayoutWrapperProps {
  children: React.ReactNode;
}

export default function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith('/dashboard');
  // const isAdminPage = pathname.startsWith('/admin'); // We can add this back if admin also needs its own header system

  // Only show the main Header if not on a dashboard page
  const showMainHeader = !isDashboardPage;

  return (
    <>
      {showMainHeader && <Header />}
      <main className={showMainHeader ? "pt-16" : ""}>
        {children}
      </main>
    </>
  );
} 