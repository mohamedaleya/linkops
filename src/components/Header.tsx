'use client';

import Link from 'next/link';
import {
  LinkIcon,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Home,
  Sparkles,
  Settings,
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
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import * as React from 'react';

const Header = () => {
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo - Left */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-90"
        >
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
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
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="from-primary/10 to-primary/5 hover:from-primary/20 flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none transition-all focus:shadow-md"
                          href="/"
                        >
                          <LinkIcon className="h-6 w-6 text-primary" />
                          <div className="mb-2 mt-4 text-lg font-bold">
                            LinkOps Pro
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Advanced link management with powerful analytics and
                            custom domains.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem title="Analytics" href="/links">
                      Real-time tracking of clicks, locations, and referrers.
                    </ListItem>
                    <ListItem title="QR Codes" href="/links">
                      Generate dynamic QR codes for every link you create.
                    </ListItem>
                    <ListItem title="Custom Links" href="/links">
                      Personalize your links with custom aliases and branding.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/links" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
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
            <Skeleton className="mr-2 hidden h-9 w-[160px] rounded-full md:block" />
          ) : (
            <>
              {session ? (
                <div className="flex items-center gap-4">
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
                        <Link href="/links">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>My Links</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile</span>
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
                    className="shadow-primary/20 rounded-full px-5 shadow-lg"
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
                  <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  LinkOps
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link
                  href="/links"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>

                {/* Features Section */}
                <div className="px-3 py-2">
                  <div className="mb-3 flex items-center gap-3 text-base font-medium">
                    <Sparkles className="h-5 w-5" />
                    Features
                  </div>
                  <div className="flex flex-col gap-2 pl-8">
                    <Link
                      href="/links"
                      className="py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Analytics
                    </Link>
                    <Link
                      href="/links"
                      className="py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      QR Codes
                    </Link>
                    <Link
                      href="/links"
                      className="py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Custom Links
                    </Link>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-2 h-px bg-border" />

                {/* Auth Section */}
                {isPending ? (
                  <div className="px-3">
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ) : session ? (
                  <>
                    <Link
                      href="/links"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon className="h-5 w-5" />
                      My Links
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      className="hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-base font-medium text-destructive transition-colors"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await signOut();
                        window.location.href = '/';
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  </>
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
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
