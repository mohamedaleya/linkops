import {
  Shield,
  Link as LinkIcon,
  BarChart3,
  QrCode,
  UserCircle,
  Zap,
  Lock,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Explore the powerful features that make LinkOps the ultimate URL management platform.',
  alternates: { canonical: '/features' },
};

const features = [
  {
    title: 'Advanced URL Shortening',
    description:
      'Create custom, branded aliases with support for various redirect types (301, 302, 307). Manage your links with ease and flexibility.',
    icon: LinkIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Comprehensive Analytics',
    description:
      'Gain deep insights with real-time click tracking, geographic heatmaps, referrer analysis, and time-series data to understand your audience.',
    icon: BarChart3,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    title: 'End-to-End Encryption',
    description:
      'Secure your sensitive link data with top-tier encryption. Your link destinations are encrypted at rest, ensuring maximum privacy.',
    icon: Lock,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Safety Warning System',
    description:
      'Protect your users with our interstitial safety warning for potentially unsafe links. We prioritize a secure browsing experience.',
    icon: Shield,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    title: 'QR Code Generation',
    description:
      'Instantly generate dynamic QR codes for every link. Perfect for marketing campaigns, print media, and easy mobile access.',
    icon: QrCode,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    title: 'User Profiles & Avatars',
    description:
      'Personalize your experience with custom profiles. Manage your identity with integrated avatar cropping and secure authentication.',
    icon: UserCircle,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="mb-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Powerful Features for Modern Links
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          LinkOps provides everything you need to manage, track, and secure your
          URLs in one sleek, high-performance platform.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg"
          >
            <div
              className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}
            >
              <feature.icon className={`h-6 w-6 ${feature.color}`} />
            </div>
            <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
