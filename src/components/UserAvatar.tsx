'use client';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user:
    | {
        name?: string | null;
        image?: string | null;
      }
    | null
    | undefined;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  user,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const name = user?.name || '';
  const image = user?.image || undefined;

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  return (
    <Avatar className={cn('h-10 w-10', className)}>
      <AvatarImage
        src={image}
        alt={name || 'User avatar'}
        className={imageClassName}
      />
      <AvatarFallback
        className={cn('bg-primary/5 font-bold text-primary', fallbackClassName)}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
