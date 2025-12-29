import { ShieldCheck, Lock, Key, Eye } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security',
  description:
    'Learn about the security measures LinkOps employs to protect your data.',
  alternates: { canonical: '/security' },
};

export default function SecurityPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Security</h1>
        <p className="mt-4 text-muted-foreground">
          How we protect your data at LinkOps
        </p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold">Our Commitment to Security</h2>
          <p>
            Security is at the core of LinkOps. We employ industry-standard
            security measures to protect your data and ensure the reliability of
            our link management services.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border p-6">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Encryption</h3>
            <p className="text-sm text-muted-foreground">
              All data transmitted between your browser and our servers is
              encrypted using TLS/SSL. Sensitive information like passwords and
              API keys are hashed using industry-standard algorithms.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border p-6">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              We use secure authentication providers and support OAuth for safe
              sign-ins. Multi-factor authentication options are being
              implemented to add an extra layer of protection.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border p-6">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Our systems are continuously monitored for unusual activity or
              potential security threats. We perform regular audits and updates
              to our infrastructure.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border p-6">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Reliability</h3>
            <p className="text-sm text-muted-foreground">
              We use redundant infrastructure and regular backups to ensure high
              availability and data persistence, even in the event of unexpected
              failures.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-semibold">Responsible Disclosure</h2>
          <p>
            If you believe you have found a security vulnerability in LinkOps,
            please report it to us immediately at security@linkops.at. We
            appreciate your help in keeping our community safe.
          </p>
        </section>
      </div>
    </div>
  );
}
