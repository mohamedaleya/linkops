import { cn } from '@/lib/utils';
import React from 'react';

export const Logo = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'svg'>) => {
  return (
    <svg
      viewBox="0 0 125 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-auto', className)}
      {...props}
    >
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />

      <svg
        x="6"
        y="6"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>

      <text
        x="40"
        y="23"
        className="fill-foreground font-bold"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        fontSize="20"
        letterSpacing="-0.5"
      >
        LinkOps
      </text>
    </svg>
  );
};
