'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check URL path to determine layout: If ''/timeline'' is included, use wide layout
  const isWidePage = pathname?.includes('/timeline');

  if (isWidePage) {
    return (
        <div className="w-full py-4 px-8 min-h-screen">
            {children}
        </div>
    );
  }

  // Other paths use standard layout (mobile)
  return (
    <div className="max-w-screen-sm w-full p-4">
      {children}
    </div>
  );
}