'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { TRANSITIONS, TAILWIND_TRANSITIONS } from '@/lib/animations';

// ─── Page transitions (for route changes) ────────────────────────────────────

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div
      initial={TRANSITIONS.page.initial}
      animate={TRANSITIONS.page.animate}
      exit={TRANSITIONS.page.exit}
      transition={TRANSITIONS.page.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Modal/Dialog transitions ────────────────────────────────────────────────

interface AnimatedModalProps {
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export function AnimatedModal({ children, className = '' }: AnimatedModalProps) {
  return (
    <motion.div
      initial={TRANSITIONS.modal.initial}
      animate={TRANSITIONS.modal.animate}
      exit={TRANSITIONS.modal.exit}
      transition={TRANSITIONS.modal.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Card transitions ───────────────────────────────────────────────────────

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  style,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`${TAILWIND_TRANSITIONS.card} ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Section transitions (staggered children) ───────────────────────────────

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedSection({
  children,
  className = '',
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial={TRANSITIONS.staggerContainer.initial}
      animate={TRANSITIONS.staggerContainer.animate}
      exit={TRANSITIONS.staggerContainer.exit}
      variants={TRANSITIONS.staggerContainer.variants}
      className={`${TAILWIND_TRANSITIONS.section} ${className}`}
    >
      {children}
    </motion.section>
  );
}

// ─── List item transitions (for staggered lists) ─────────────────────────────

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedListItem({
  children,
  className = '',
}: AnimatedListItemProps) {
  return (
    <motion.li
      variants={TRANSITIONS.staggerItem.variants}
      className={className}
    >
      {children}
    </motion.li>
  );
}

// ─── Generic container (use for custom transitions) ──────────────────────────

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  type?: 'fade' | 'slide-up' | 'scale' | 'slide-down';
  delay?: number;
}

export function AnimatedContainer({
  children,
  className = '',
  type = 'fade',
  delay = 0,
}: AnimatedContainerProps) {
  const presets = {
    fade: TRANSITIONS.fadeIn,
    'slide-up': TRANSITIONS.slideUp,
    scale: TRANSITIONS.scaleIn,
    'slide-down': TRANSITIONS.slideDown,
  };

  const preset = presets[type];

  return (
    <motion.div
      initial={preset.initial}
      animate={preset.animate}
      exit={preset.exit}
      transition={{ ...preset.transition, delay } as any}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Button transitions (hover/click effects) ──────────────────────────────

interface AnimatedButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
}

export function AnimatedButton({
  children,
  className = '',
  onClick,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={`${TAILWIND_TRANSITIONS.button} ${className}`}
      onClick={onClick}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
