'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-6 flex justify-center">
            <Logo className="h-10 w-auto" />
          </div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
            <Mail className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription>
            We've sent a verification link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p className="mb-4">
            Click the link in the email to verify your account and unlock all
            features. If you don't see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 border-t bg-muted/30 p-6">
          <Button asChild className="w-full">
            <Link href="/login">
              Return to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="w-full text-muted-foreground"
          >
            <Link href="/dashboard">Skip for now</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
