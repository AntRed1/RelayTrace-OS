/**
 * Global animation/transition presets
 * Used throughout the app for consistent, professional animations
 */

export const TRANSITIONS = {
  // Page & route transitions
  page: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  },

  // Modal/dialog transitions
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },

  // Sidebar/drawer transitions
  drawer: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3 },
  },

  // Fade in (generic)
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Slide up (from bottom)
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.25 },
  },

  // Slide down (from top)
  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.25 },
  },

  // Scale in
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Stagger children
  staggerContainer: {
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.1,
        },
      },
    },
  },

  staggerItem: {
    variants: {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
      },
    },
  },
};

// Tailwind-based transition classes for quick styling
export const TAILWIND_TRANSITIONS = {
  button:
    'transition-all duration-200 ease-out hover:scale-105 active:scale-95',
  card: 'transition-all duration-300 ease-out hover:shadow-lg',
  link: 'transition-colors duration-200 ease-out',
  section: 'transition-all duration-300 ease-out',
};
