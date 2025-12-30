'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Globe, BarChart3, Lock, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Lightning Fast',
    description:
      'Sub-millisecond latency for global redirects using edge-ready Redis caching.',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'group-hover:border-yellow-500/50',
  },
  {
    title: 'Enterprise Security',
    description:
      'End-to-end encryption, advanced rate limiting, and automated threat detection.',
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'group-hover:border-blue-500/50',
  },
  {
    title: 'Real-time Insights',
    description:
      'Drill down into every click with geographic data, device tracking, and referrer analysis.',
    icon: BarChart3,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'group-hover:border-emerald-500/50',
  },
  {
    title: 'Custom Branding',
    description:
      "Personalize your links with custom slugs and domains to boost your brand's trust.",
    icon: Globe,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'group-hover:border-purple-500/50',
  },
  {
    title: 'Privacy First',
    description:
      'Your data is encrypted at rest and in transit. We prioritize your anonymity.',
    icon: Lock,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'group-hover:border-orange-500/50',
  },
  {
    title: 'Scalable Infrastructure',
    description:
      'Built on high-performance cloud architecture to handle millions of requests.',
    icon: Rocket,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'group-hover:border-rose-500/50',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-4 inline-flex items-center rounded-full border bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary"
        >
          Powerful Features
        </motion.div>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Everything you need to{' '}
          <span className="gradient-text">manage links</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Built for speed, security, and scalability. LinkOps gives you all the
          tools to grow your audience and protect your data.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={item}
            className={cn(
              'group relative overflow-hidden rounded-3xl border bg-card/50 p-8 transition-all hover:-translate-y-1 hover:shadow-xl',
              feature.borderColor
            )}
          >
            {/* Background Gradient Glow */}
            <div
              className={cn(
                'absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-20',
                feature.bgColor
              )}
            />

            <div className="relative z-10">
              <div
                className={cn(
                  'mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border bg-background shadow-sm transition-transform group-hover:scale-110',
                  feature.borderColor
                )}
              >
                <feature.icon className={cn('h-6 w-6', feature.color)} />
              </div>

              <h3 className="mb-3 text-xl font-bold tracking-tight">
                {feature.title}
              </h3>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
