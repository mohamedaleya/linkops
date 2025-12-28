import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, PowerOff, ArrowLeft, Home } from 'lucide-react';

export default async function LinkErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const type = resolvedSearchParams.type as string;

  const errorConfig = {
    disabled: {
      icon: <PowerOff className="h-12 w-12 text-destructive" />,
      title: 'Link Disabled',
      description: 'This shortened link has been deactivated by its owner.',
      color: 'destructive',
    },
    expired: {
      icon: <Clock className="h-12 w-12 text-muted-foreground" />,
      title: 'Link Expired',
      description:
        'This link has reached its expiration date and is no longer active.',
      color: 'orange',
    },
    default: {
      icon: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
      title: 'Inaccessible Link',
      description:
        'There was an issue accessing this link. It might be disabled, expired, or removed.',
      color: 'muted',
    },
  };

  const config =
    errorConfig[type as keyof typeof errorConfig] || errorConfig.default;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Background Decorative Elements */}
        <div className="bg-primary/5 absolute -left-12 -top-12 -z-10 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-destructive/5 absolute -bottom-12 -right-12 -z-10 h-64 w-64 rounded-full blur-3xl" />

        <div className="bg-card/80 border-muted-foreground/20 space-y-8 rounded-3xl border p-8 text-center shadow-2xl backdrop-blur-xl duration-500 animate-in fade-in zoom-in">
          <div className="flex justify-center">
            <div className="bg-muted/50 rounded-2xl border border-border p-4 shadow-inner">
              {config.icon}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.title}
            </h1>
            <p className="leading-relaxed text-muted-foreground">
              {config.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              asChild
              size="lg"
              className="shadow-primary/20 h-12 font-bold shadow-lg transition-all"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button variant="ghost" asChild className="h-12 font-medium">
              <Link href="/links">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground/50 pt-4 text-[10px] font-bold uppercase tracking-widest">
            Error Code: {type?.toUpperCase() || 'UNKNOWN'}
          </p>
        </div>
      </div>
    </div>
  );
}
