'use client';

import Link from 'next/link';
import {
  LinkIcon,
  LogOut,
  User as UserIcon,
  Home,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Menu,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { useSession, signOut } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { UserAvatar } from './UserAvatar';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useEncryption } from '@/context/EncryptionContext';
import { EncryptionSetupDialog } from './EncryptionSetupDialog';
import { UnlockVaultDialog } from './UnlockVaultDialog';
import * as React from 'react';
import { Skeleton } from './ui/skeleton';

const Header = () => {
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isSetupOpen, setIsSetupOpen] = React.useState(false);
  const [isUnlockOpen, setIsUnlockOpen] = React.useState(false);

  const { isEncryptionEnabled, isKeyUnlocked, lock, isSupported, isFetching } =
    useEncryption();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo - Left */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-90"
        >
          <div className="logo-gradient rounded-lg p-1.5 text-primary-foreground">
            <LinkIcon className="h-5 w-5" />
          </div>
          <span>LinkOps</span>
        </Link>

        {/* Navigation Menu - Centered (Desktop) */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/link-directory"
                    className="flex items-center gap-2"
                  >
                    Link Directory
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/features" className="flex items-center gap-2">
                    Features
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/pricing" className="flex items-center gap-2">
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/contact" className="flex items-center gap-2">
                    Contact
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
          {isPending ? (
            <div className="flex items-center gap-2">
              <Skeleton className="hidden h-9 w-[70px] rounded-full md:block" />
              <Skeleton className="hidden h-9 w-[80px] rounded-full md:block" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : (
            <>
              {session ? (
                <div className="flex items-center gap-2">
                  {/* Vault Button - Desktop */}
                  {isSupported && isFetching ? (
                    <Skeleton className="hidden h-9 w-[85px] rounded-full md:block" />
                  ) : (
                    isSupported && (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'hidden h-9 gap-2 rounded-full px-3 md:flex',
                                isEncryptionEnabled
                                  ? isKeyUnlocked
                                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-600 dark:text-green-400 dark:hover:text-green-400'
                                    : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-400'
                                  : 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                              )}
                              onClick={() => {
                                if (!isEncryptionEnabled) setIsSetupOpen(true);
                                else if (!isKeyUnlocked) setIsUnlockOpen(true);
                                else lock();
                              }}
                            >
                              {isEncryptionEnabled ? (
                                isKeyUnlocked ? (
                                  <ShieldCheck className="h-4 w-4" />
                                ) : (
                                  <ShieldAlert className="h-4 w-4" />
                                )
                              ) : (
                                <Shield className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">
                                {isEncryptionEnabled
                                  ? isKeyUnlocked
                                    ? 'Vault'
                                    : 'Locked'
                                  : 'Setup Vault'}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="max-w-[280px] space-y-2 p-3"
                          >
                            <div
                              className={cn(
                                'flex items-center gap-2 border-b pb-2 font-bold',
                                isEncryptionEnabled
                                  ? isKeyUnlocked
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                  : 'text-primary'
                              )}
                            >
                              {isEncryptionEnabled ? (
                                isKeyUnlocked ? (
                                  <>
                                    <ShieldCheck className="h-3.5 w-3.5" />{' '}
                                    Vault Unlocked
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="h-3.5 w-3.5" />{' '}
                                    Vault Locked
                                  </>
                                )
                              ) : (
                                <>
                                  <Lock className="h-3.5 w-3.5" /> Enable
                                  Encryption
                                </>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {isEncryptionEnabled
                                ? isKeyUnlocked
                                  ? 'Your vault is active. Links are encrypted locally. Click to lock.'
                                  : 'Click to unlock your vault and create encrypted links.'
                                : 'Click to set up end-to-end encryption for your links.'}
                            </p>
                            {isKeyUnlocked && (
                              <p className="rounded border border-green-500/20 bg-green-500/10 p-1.5 text-[10px] text-green-700 dark:text-green-300">
                                Auto-locks after 15 min of inactivity.
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  )}
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="hidden md:flex"
                        >
                          <Link href="/dashboard">
                            <LayoutDashboard className="h-5 w-5" />
                            <span className="sr-only">Dashboard</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Dashboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 overflow-hidden rounded-full border p-0 ring-zinc-500/20 transition-all hover:bg-transparent hover:ring-2 hover:ring-zinc-500/40"
                      >
                        <UserAvatar
                          user={session.user}
                          className="h-10 w-10"
                          fallbackClassName="text-xs"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/account">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Account</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={async () => {
                          await signOut();
                          window.location.href = '/';
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <nav className="mr-2 hidden items-center gap-2 text-sm font-medium md:flex">
                  <Link
                    href="/login"
                    className="rounded-full px-5 py-2 transition-colors hover:bg-accent hover:text-primary"
                  >
                    Log In
                  </Link>
                  <Button
                    size="sm"
                    asChild
                    className="rounded-full px-5 shadow-lg shadow-primary/20"
                  >
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </nav>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="logo-gradient rounded-lg p-1.5 text-primary-foreground">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  LinkOps
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex h-[calc(100vh-8rem)] flex-col gap-4">
                {/* Primary Navigation */}
                <div className="flex flex-col gap-2">
                  <Link
                    href="/link-directory"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Link Directory
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link
                    href="/features"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  {session && (
                    <>
                      <div className="mt-4 border-t pt-4">
                        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Dashboard & Security
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                      {/* Vault Button - Mobile */}
                      {isSupported && isFetching ? (
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ) : (
                        isSupported && (
                          <button
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-base font-medium transition-colors',
                              isEncryptionEnabled
                                ? isKeyUnlocked
                                  ? 'text-green-600 hover:bg-green-500/20 hover:text-green-600 dark:text-green-400 dark:hover:text-green-400'
                                  : 'text-amber-600 hover:bg-amber-500/20 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-400'
                                : 'text-primary hover:bg-primary/10 hover:text-primary'
                            )}
                            onClick={() => {
                              if (!isEncryptionEnabled) {
                                setMobileMenuOpen(false);
                                setIsSetupOpen(true);
                              } else if (!isKeyUnlocked) {
                                setMobileMenuOpen(false);
                                setIsUnlockOpen(true);
                              } else {
                                lock();
                              }
                            }}
                          >
                            {isEncryptionEnabled ? (
                              isKeyUnlocked ? (
                                <ShieldCheck className="h-5 w-5" />
                              ) : (
                                <ShieldAlert className="h-5 w-5" />
                              )
                            ) : (
                              <Shield className="h-5 w-5" />
                            )}
                            {isEncryptionEnabled
                              ? isKeyUnlocked
                                ? 'Vault Unlocked'
                                : 'Vault Locked'
                              : 'Set Up Vault'}
                          </button>
                        )
                      )}
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5" />
                        Profile
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-5 w-5" />
                        Account
                      </Link>
                    </>
                  )}
                </div>

                {/* Spacer to push auth to bottom */}
                <div className="flex-1" />

                {/* Auth Section - Fixed to bottom */}
                <div className="border-t pt-4">
                  {isPending ? (
                    <div className="flex flex-col gap-3 px-3">
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ) : session ? (
                    <button
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-base font-medium text-destructive transition-colors hover:bg-destructive/10"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await signOut();
                        window.location.href = '/';
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 px-3">
                      <Button
                        variant="outline"
                        asChild
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/login">Log In</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/register">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Encryption Dialogs */}
      <EncryptionSetupDialog open={isSetupOpen} onOpenChange={setIsSetupOpen} />
      <UnlockVaultDialog open={isUnlockOpen} onOpenChange={setIsUnlockOpen} />
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export default Header;
