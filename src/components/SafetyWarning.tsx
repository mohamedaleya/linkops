'use client';

import {
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SafetyWarningProps {
  shortenedId: string;
  hostname: string;
}

export function SafetyWarning({ shortenedId, hostname }: SafetyWarningProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/10 via-background to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-destructive/20 bg-card/80 shadow-2xl shadow-destructive/10 ring-1 ring-destructive/20 backdrop-blur-sm">
          <div className="absolute left-0 top-0 h-1 w-full bg-destructive/50" />

          <CardHeader className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 ring-8 ring-destructive/5">
              <ShieldAlert className="h-10 w-10 animate-pulse text-destructive" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-foreground">
              Security Warning
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">
              Potentially unsafe link detected
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-8 text-center">
            <div className="space-y-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our safety systems have flagged this destination as potentially
                harmful or containing explicit content.
              </p>

              <div className="flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-border bg-muted/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Destination Host
                </span>
                <span className="w-full truncate break-all font-mono text-sm font-bold text-destructive">
                  {hostname}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-left text-[13px] text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Visiting this site may lead to malware, phishing, or exposure to
                inappropriate content. Proceed only if you trust the source.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 p-8 pt-4">
            <Button
              asChild
              className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back to Safety
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="h-10 w-full text-sm font-bold uppercase tracking-wider text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
              asChild
            >
              <Link href={`/s/${shortenedId}?bypass=true`}>
                Proceed Anyway
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
          Protected by LinkOps Guard
        </p>
      </motion.div>
    </div>
  );
}
