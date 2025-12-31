import { Cookie } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Understand how LinkOps uses cookies to improve your experience.',
  alternates: { canonical: '/cookies' },
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Cookie className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: December 29, 2025
        </p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold">1. What are Cookies?</h2>
          <p>
            Cookies are small pieces of text sent by your web browser by a
            website you visit. A cookie file is stored in your web browser and
            allows the Service or a third-party to recognize you and make your
            next visit easier and the Service more useful to you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">
            2. How LinkOps uses Cookies
          </h2>
          <p>
            When you use and access the Service, we may place a number of
            cookies files in your web browser. We use cookies for the following
            purposes:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>To enable certain functions of the Service.</li>
            <li>To provide analytics.</li>
            <li>To store your preferences.</li>
            <li>
              To enable authentication and prevent fraudulent use of user
              accounts.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">3. Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Essential Cookies</h3>
              <p>
                We use essential cookies to authenticate users and prevent
                fraudulent use of user accounts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Preference Cookies</h3>
              <p>
                We use preference cookies to remember information that changes
                the way the Service behaves or looks, such as your preferred
                theme.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Analytics Cookies</h3>
              <p>
                We use analytics cookies to track information how the Service is
                used so that we can make improvements.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">
            4. Your Choices Regarding Cookies
          </h2>
          <p>
            If you&apos;d like to delete cookies or instruct your web browser to
            delete or refuse cookies, please visit the help pages of your web
            browser. Please note, however, that if you delete cookies or refuse
            to accept them, you might not be able to use all of the features we
            offer.
          </p>
        </section>
      </div>
    </div>
  );
}
