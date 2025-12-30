import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Simple, Transparent <span className="text-primary">Pricing</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          LinkOps is currently free to use. Enjoy all the features without any
          cost.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-1 lg:max-w-md">
        <div className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

          <div className="mb-8">
            <h3 className="text-2xl font-bold">Pro</h3>
            <p className="text-muted-foreground">
              Everything you need to manage your links.
            </p>
          </div>

          <div className="mb-8 flex items-end gap-2">
            <span className="text-5xl font-bold">$0</span>
            <span className="mb-1 text-muted-foreground">/month</span>
          </div>

          <div className="mb-8 space-y-4">
            {[
              'Unlimited Links',
              'Advanced Analytics',
              'Custom Aliases',
              'QR Code Generation',
              'Password Protection',
              'Expiration Dates',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button className="w-full" size="lg" asChild>
            <Link href="/register">Get Started for Free</Link>
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
