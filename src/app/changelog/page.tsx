import { Sparkles, CheckCircle2, Rocket, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Follow the latest updates, new features, and improvements to LinkOps.',
  alternates: { canonical: '/changelog' },
};

export default function ChangelogPage() {
  const updates = [
    {
      version: 'v1.2.0',
      date: 'December 29, 2025',
      title: 'UI Enhancements & Security Fixes',
      items: [
        'Added visual sorting indicators to dashboard tables.',
        'Improved password field security with masked placeholders.',
        'Refined username availability check logic in profile settings.',
        'Enhanced advanced configuration UI with distinct active states.',
        'Cleaned up navigation and footer for a more focused experience.',
        'Added comprehensive legal and security documentation.',
      ],
      icon: Sparkles,
      color: 'text-primary',
    },
    {
      version: 'v1.1.0',
      date: 'December 28, 2025',
      title: 'Automated Deployment & Branding',
      items: [
        'Officially renamed project to LinkOps.',
        'Implemented GitHub Actions for automated CI/CD deployment.',
        'Standardized modal and dialog styles across the application.',
        'Added support for custom slugs and advanced redirect types.',
        'Improved avatar management and storage handling.',
      ],
      icon: Rocket,
      color: 'text-emerald-500',
    },
    {
      version: 'v1.0.0',
      date: 'December 27, 2025',
      title: 'Initial Release',
      items: [
        'Core URL shortening functionality.',
        'User authentication and profile management.',
        'Dashboard for managing saved links.',
        'Real-time click analytics and visit tracking.',
        'Responsive design for mobile and desktop.',
      ],
      icon: CheckCircle2,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
        <p className="mt-4 text-muted-foreground">
          Follow the latest updates and improvements on LinkOps
        </p>
      </div>

      <div className="space-y-12">
        {updates.map((update) => (
          <div
            key={update.version}
            className="relative pl-8 before:absolute before:bottom-0 before:left-0 before:top-2 before:w-px before:bg-border last:before:hidden"
          >
            <div
              className={`absolute left-[-12px] top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background ${update.color}`}
            >
              <update.icon className="h-3.5 w-3.5" />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                  {update.version}
                </span>
                <h2 className="text-xl font-bold">{update.title}</h2>
                <time className="text-sm text-muted-foreground md:ml-auto">
                  {update.date}
                </time>
              </div>

              <ul className="grid gap-2 text-muted-foreground">
                {update.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="bg-primary/40 mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
