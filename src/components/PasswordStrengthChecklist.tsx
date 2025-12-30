'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface PasswordRule {
  id: string;
  label: string;
  test: (password: string, confirmPassword?: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (p) => p.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: 'special',
    label: 'At least one special character',
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

interface PasswordStrengthChecklistProps {
  password: string;
  confirmPassword?: string;
}

export function checkPasswordRequirements(
  password: string,
  confirmPassword?: string
): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password, confirmPassword));
}

export function PasswordStrengthChecklist({
  password,
  confirmPassword,
}: PasswordStrengthChecklistProps) {
  const results = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      met: rule.test(password, confirmPassword),
    }));
  }, [password, confirmPassword]);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-muted-foreground/10 bg-muted/30 p-4 backdrop-blur-sm duration-300 animate-in fade-in slide-in-from-top-2">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Password Requirements
      </p>
      <div className="grid grid-cols-1 gap-2">
        {results.map((result) => (
          <div
            key={result.id}
            className={cn(
              'flex items-center gap-2 text-sm transition-colors duration-300',
              result.met ? 'text-emerald-500' : 'text-muted-foreground'
            )}
          >
            <div
              className={cn(
                'rounded-full border p-0.5 transition-all duration-300',
                result.met
                  ? 'border-emerald-500/20 bg-emerald-500/10'
                  : 'border-muted-foreground/20 bg-muted'
              )}
            >
              {result.met ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </div>
            <span
              className={cn(
                'transition-all duration-300',
                result.met ? 'font-medium' : 'font-normal'
              )}
            >
              {result.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-muted-foreground/10 pt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Security Level
          </span>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
              results.filter((r) => r.met).length === 5
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                : results.filter((r) => r.met).length >= 3
                  ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                  : 'border-red-500/20 bg-red-500/10 text-red-500'
            )}
          >
            {results.filter((r) => r.met).length === 5
              ? 'Strong'
              : results.filter((r) => r.met).length >= 3
                ? 'Medium'
                : 'Weak'}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              results.filter((r) => r.met).length === 5
                ? 'bg-emerald-500'
                : results.filter((r) => r.met).length >= 3
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            )}
            style={{
              width: `${(results.filter((r) => r.met).length / 5) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
