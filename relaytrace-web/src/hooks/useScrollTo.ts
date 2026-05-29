'use client';

import { useCallback } from 'react';

/**
 * Hook para scroll suave a elementos con offset para navbar
 */
export function useScrollTo() {
  const scrollTo = useCallback((elementId: string, offset = 80) => {
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Element with id "${elementId}" not found`);
        return;
      }

      // Calcular posición considerando navbar fixed
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      // Scroll suave
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Focus para accessibility
      element.focus({ preventScroll: true });
    }, 0);
  }, []);

  return { scrollTo };
}
