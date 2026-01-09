'use client';

import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Link2,
  MousePointerClick,
  Globe2,
  Users,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  isDecimal?: boolean;
}

const stats: StatItem[] = [
  {
    label: 'Links Created',
    value: 125000,
    suffix: '+',
    icon: Link2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Short links generated',
  },
  {
    label: 'Total Clicks',
    value: 2500000,
    suffix: '+',
    icon: MousePointerClick,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Redirects processed',
  },
  {
    label: 'Countries',
    value: 180,
    suffix: '+',
    icon: Globe2,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Worldwide reach',
  },
  {
    label: 'Active Users',
    value: 15000,
    suffix: '+',
    icon: Users,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Growing community',
  },
  {
    label: 'Uptime',
    value: 99.9,
    suffix: '%',
    icon: TrendingUp,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    description: 'Reliable service',
  },
  {
    label: 'Threats Blocked',
    value: 50000,
    suffix: '+',
    icon: Shield,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    description: 'Security protected',
  },
];

function AnimatedCounter({
  value,
  suffix,
  isDecimal = false,
}: {
  value: number;
  suffix: string;
  isDecimal?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: 2000,
  });

  const rounded = useTransform(spring, (latest) => {
    if (isDecimal) {
      return latest.toFixed(1);
    }
    return Math.round(latest).toLocaleString();
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      setDisplayValue(typeof v === 'string' ? parseFloat(v) : v);
    });
    return () => unsubscribe();
  }, [rounded]);

  const formatValue = () => {
    if (isDecimal) {
      return displayValue.toFixed(1);
    }
    return Math.round(displayValue).toLocaleString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatValue()}
      {suffix}
    </span>
  );
}

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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function Statistics() {
  const [statsData, setStatsData] = useState<Record<string, number> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dynamicStats: StatItem[] = [
    {
      label: 'Links Created',
      value: statsData?.linksCreated ?? 0,
      suffix: '+',
      icon: Link2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Short links generated',
    },
    {
      label: 'Total Clicks',
      value: statsData?.totalClicks ?? 0,
      suffix: '+',
      icon: MousePointerClick,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: 'Redirects processed',
    },
    {
      label: 'Countries',
      value: 180,
      suffix: '+',
      icon: Globe2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Worldwide reach',
    },
    {
      label: 'Active Users',
      value: statsData?.activeUsers ?? 0,
      suffix: '+',
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'Growing community',
    },
    {
      label: 'Uptime',
      value: 99.9,
      suffix: '%',
      icon: TrendingUp,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      description: 'Reliable service',
      isDecimal: true,
    },
    {
      label: 'Threats Blocked',
      value: 50000,
      suffix: '+',
      icon: Shield,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Security protected',
    },
  ];

  return (
    <section className="relative overflow-hidden py-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

      {/* Decorative Elements */}
      <div className="absolute left-1/4 top-1/4 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center rounded-full border bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary"
          >
            Platform Statistics
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight md:text-5xl"
          >
            Trusted by <span className="gradient-text">thousands</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Join the growing community of professionals who trust LinkOps for
            their link management needs.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6"
        >
          {loading
            ? // Skeleton loading state
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl border bg-card/50 p-6 backdrop-blur-sm"
                >
                  <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-xl bg-muted" />
                  <div className="mx-auto mb-2 h-8 w-20 animate-pulse rounded bg-muted" />
                  <div className="mx-auto h-4 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))
            : dynamicStats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="group relative overflow-hidden rounded-2xl border bg-card/50 p-6 text-center backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Hover Glow Effect */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100',
                      stat.bgColor
                    )}
                    style={{ opacity: 0.05 }}
                  />

                  <div className="relative z-10">
                    <div
                      className={cn(
                        'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border bg-background shadow-sm transition-transform group-hover:scale-110',
                        stat.bgColor
                      )}
                    >
                      <stat.icon className={cn('h-5 w-5', stat.color)} />
                    </div>

                    <div
                      className={cn(
                        'mb-1 text-2xl font-bold tracking-tight md:text-3xl',
                        stat.color
                      )}
                    >
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix}
                        isDecimal={stat.isDecimal}
                      />
                    </div>

                    <div className="text-sm font-medium text-foreground">
                      {stat.label}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </motion.div>
              ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Real-time stats</span>{' '}
            — Updated continuously as our platform grows
          </p>
        </motion.div>
      </div>
    </section>
  );
}
