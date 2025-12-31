'use client';

import Marquee from 'react-fast-marquee';
import { Sparkles, Rocket, AlertTriangle, Construction } from 'lucide-react';

const AlphaBanner = () => {
  const items = [
    { icon: Sparkles, text: 'Alpha Version' },
    { icon: AlertTriangle, text: 'Features may change' },
    { icon: Rocket, text: 'New features coming soon' },
    { icon: Construction, text: 'Work in progress' },
  ];

  return (
    <div className="relative z-50 h-9 w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 [&_.rfm-initial-child-container]:!overflow-x-hidden [&_.rfm-marquee-container]:!overflow-x-hidden [&_.rfm-marquee]:!overflow-x-hidden">
      {/* Animated glow effect */}
      <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      <Marquee
        speed={40}
        gradient={false}
        pauseOnHover
        className="py-2"
        autoFill
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="mx-8 flex items-center gap-2 text-sm font-medium"
          >
            <item.icon className="h-3.5 w-3.5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {item.text}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default AlphaBanner;
