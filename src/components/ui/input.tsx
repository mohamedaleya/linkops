'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, autoComplete, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    // Check if this is a password field that wants to suppress suggestions (signaled by autoComplete="off")
    const isPassword = type === 'password';
    const isOff = autoComplete === 'off';
    const shouldApplyReadOnlyHack = isPassword && isOff;

    return (
      <input
        type={type}
        autoComplete={autoComplete}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-base shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        placeholder={type === 'password' ? '••••••••' : props.placeholder}
        readOnly={shouldApplyReadOnlyHack && !isFocused}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
