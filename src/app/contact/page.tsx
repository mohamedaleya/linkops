import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the LinkOps team for support, feedback, or inquiries.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have questions about LinkOps? We&apos;re here to help. Send us a
              message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Email Us</h3>
              <p className="text-muted-foreground">contact@linkops.at</p>
              <p className="text-sm text-muted-foreground">
                Typical response within 24 hours
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
