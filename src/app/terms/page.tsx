import { Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Read the terms and conditions for using the LinkOps URL management platform.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Scale className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Terms and Conditions
        </h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: December 29, 2025
        </p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
          <p>
            By accessing or using LinkOps, you agree to be bound by these Terms
            and Conditions and our Privacy Policy. If you disagree with any part
            of the terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">2. Use of Service</h2>
          <p>
            LinkOps provides a URL shortening and link management platform. You
            agree to use the service only for lawful purposes and in accordance
            with these Terms.
          </p>
          <p className="mt-4 font-semibold text-destructive">
            Prohibited uses include:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Shortening links to malware, phishing sites, or illegal content.
            </li>
            <li>Spamming or sending unsolicited communications.</li>
            <li>
              Attempting to bypass security measures or reverse engineer the
              platform.
            </li>
            <li>
              Using the service for any purpose that violates local, state, or
              international laws.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">3. User Accounts</h2>
          <p>
            When you create an account, you must provide accurate and complete
            information. You are responsible for maintaining the confidentiality
            of your account and password.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">4. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the
            Service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever, including without
            limitation a breach of the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
          <p>
            In no event shall LinkOps, nor its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">6. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. What constitutes a material change will be
            determined at our sole discretion.
          </p>
        </section>
      </div>
    </div>
  );
}
