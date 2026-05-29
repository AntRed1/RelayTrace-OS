'use client';

import { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';

/**
 * AnimationsProvider
 * Wraps the entire app to enable smooth route transitions and animations.
 *
 * Usage:
 *   <AnimationsProvider>
 *     <YourApp />
 *   </AnimationsProvider>
 */

interface AnimationsProviderProps {
  children: ReactNode;
}

export function AnimationsProvider({ children }: AnimationsProviderProps) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
