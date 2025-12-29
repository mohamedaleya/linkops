import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how LinkOps collects, uses, and protects your personal data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: December 29, 2025
        </p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            At LinkOps, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when
            you create an account, shorten a URL, or communicate with us. This
            may include:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Email address and basic profile information (name, avatar).</li>
            <li>
              URLs you shorten and associated metadata (custom slugs, expiration
              dates).
            </li>
            <li>
              Usage data, including IP addresses, browser types, and access
              times for analytics purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">
            3. How We Use Your Information
          </h2>
          <p>We use the collected information for various purposes:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>To provide and maintain our Service.</li>
            <li>To notify you about changes to our Service.</li>
            <li>To provide customer support.</li>
            <li>
              To gather analysis or valuable information so that we can improve
              our Service.
            </li>
            <li>
              To monitor the usage of our Service and detect, prevent, and
              address technical issues.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p>
            The security of your data is important to us, but remember that no
            method of transmission over the Internet, or method of electronic
            storage is 100% secure. While we strive to use commercially
            acceptable means to protect your Personal Data, we cannot guarantee
            its absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at privacy@linkops.at.
          </p>
        </section>
      </div>
    </div>
  );
}
