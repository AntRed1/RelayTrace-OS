'use client';

import { ReactNode } from 'react';
import { useScrollTo } from '@/hooks/useScrollTo';
import { AnimatedButton } from './animated';

interface SmoothScrollLinkProps {
  href: string; // elemento ID sin #, ej: "features", "pricing"
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * SmoothScrollLink
 * Enlace que hace scroll suave a una sección de la página
 *
 * Uso:
 * <SmoothScrollLink href="features">Ver características</SmoothScrollLink>
 */
export function SmoothScrollLink({
  href,
  children,
  className = '',
  onClick,
}: SmoothScrollLinkProps) {
  const { scrollTo } = useScrollTo();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    scrollTo(href);
  };

  return (
    <a
      href={`#${href}`}
      onClick={handleClick}
      className={`transition-colors duration-200 ease-out hover:text-blue-600 ${className}`}
    >
      {children}
    </a>
  );
}

/**
 * SmoothScrollButton
 * Botón que hace scroll suave a una sección
 *
 * Uso:
 * <SmoothScrollButton href="contact">Contactar</SmoothScrollButton>
 */
interface SmoothScrollButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  href: string;
  children: ReactNode;
}

export function SmoothScrollButton({
  href,
  children,
  className = '',
  ...props
}: SmoothScrollButtonProps) {
  const { scrollTo } = useScrollTo();

  const handleClick = () => {
    scrollTo(href);
  };

  return (
    <AnimatedButton
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
}
