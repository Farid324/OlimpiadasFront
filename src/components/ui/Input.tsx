// src/components/ui/Input.tsx
'use client';
import * as React from 'react';

function cn(...c: (string | undefined)[]) { return c.filter(Boolean).join(' '); }

export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'border border-gray-300 rounded-md h-10 w-full px-3 text-sm outline-none',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
        className
      )}
      {...props}
    />
  );
}
