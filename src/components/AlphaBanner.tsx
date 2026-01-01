'use client';

import Marquee from 'react-fast-marquee';
import { Sparkles, Rocket, AlertTriangle, Construction } from 'lucide-react';

const AlphaBanner = () => {
  const items = [
    { icon: Sparkles, text: "You're exploring LinkOps Alpha!" },
    { icon: AlertTriangle, text: 'Expect some rough edges' },
    { icon: Rocket, text: 'Help us shape the future of link management' },
    { icon: Construction, text: 'Your feedback matters' },
  ];

  return (
    <div className="relative z-50 h-9 w-full overflow-hidden border-b border-white/10 [&_.rfm-initial-child-container]:!overflow-x-hidden [&_.rfm-marquee-container]:!overflow-x-hidden [&_.rfm-marquee]:!overflow-x-hidden">
      {/* Animated rainbow gradient background */}
      <div
        className="animate-gradient-shift absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #00d2d3, #ff6b6b)',
          backgroundSize: '300% 100%',
        }}
      />

      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/25" />

      {/* Shimmer effect */}
      <div
        className="animate-shimmer pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />

      <Marquee
        speed={40}
        gradient={false}
        pauseOnHover
        className="relative z-10 py-2"
        autoFill
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="mx-8 flex items-center gap-2 text-sm font-medium"
          >
            <item.icon className="h-3.5 w-3.5 text-white drop-shadow-sm" />
            <span className="text-white drop-shadow-sm">{item.text}</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default AlphaBanner;
