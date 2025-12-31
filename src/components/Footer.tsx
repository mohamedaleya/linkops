import Link from 'next/link';
import { LinkIcon, Github } from 'lucide-react';
import { Separator } from './ui/separator';
import packageInfo from '../../package.json';
const version = packageInfo.version;

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <div className="logo-gradient rounded-lg p-1.5 text-primary-foreground">
                <LinkIcon className="h-5 w-5" />
              </div>
              <span>LinkOps</span>
            </Link>
            <p className="mb-6 max-w-sm leading-relaxed text-muted-foreground">
              Empowering your digital presence with powerful link management
              tools. Built for performance, reliability, and scale.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/mohamedaleya/linkops"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <div className="flex flex-col items-start gap-2">
              <h3 className="font-semibold tracking-tight">Product</h3>
              <Link
                href="/features"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/link-directory"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Link Directory
              </Link>
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="font-semibold tracking-tight">Company</h3>
              <Link
                href="/contact"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact
              </Link>
              <Link
                href="/changelog"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Changelog
              </Link>
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="font-semibold tracking-tight">Legal</h3>
              <Link
                href="/privacy"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="/security"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Security
              </Link>
              <Link
                href="/cookies"
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} LinkOps. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                Version
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                v{version}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm font-medium text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
