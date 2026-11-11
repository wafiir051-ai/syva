'use client';

import type { ReactNode } from 'react';
import { MotionConfig, motion } from 'motion/react';

/** Honors the OS "reduce motion" setting for every Motion animation below it. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

const TAGS = { div: motion.div, li: motion.li } as const;

/** Rises into view once when scrolled to; `index` staggers siblings, `hover` lifts cards. */
export function Reveal({
  as = 'div',
  index = 0,
  hover = false,
  className,
  children,
}: {
  as?: keyof typeof TAGS;
  index?: number;
  hover?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const Tag = TAGS[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 18, delay: index * 0.08 },
      }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      whileHover={hover ? { y: -6, transition: { type: 'spring', stiffness: 320, damping: 20 } } : undefined}
    >
      {children}
    </Tag>
  );
}
