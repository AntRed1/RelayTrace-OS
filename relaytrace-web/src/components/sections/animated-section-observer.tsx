'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionObserverProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedSectionObserver
 * Anima la sección cuando entra en viewport (scroll effect)
 * Útil para hero, features, pricing, footer, etc.
 */
export function AnimatedSectionObserver({
  id,
  children,
  className = '',
}: AnimatedSectionObserverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // La animación ocurre automáticamente con motion.section
        }
      },
      {
        threshold: 0.1, // Animar cuando 10% sea visible
        rootMargin: '0px 0px -50px 0px', // Trigger un poco antes
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
