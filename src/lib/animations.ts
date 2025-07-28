// Animation configuration constants
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000
} as const;

export const ANIMATION_EASINGS = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const;

// Common animation classes
export const FADE_ANIMATIONS = {
  fadeIn: 'opacity-0 animate-fade-in',
  fadeOut: 'opacity-100 animate-fade-out',
  fadeInUp: 'opacity-0 translate-y-8 animate-fade-in-up',
  fadeInDown: 'opacity-0 -translate-y-8 animate-fade-in-down',
  fadeInLeft: 'opacity-0 translate-x-8 animate-fade-in-left',
  fadeInRight: 'opacity-0 -translate-x-8 animate-fade-in-right'
} as const;

export const SLIDE_ANIMATIONS = {
  slideUp: 'translate-y-full animate-slide-up',
  slideDown: '-translate-y-full animate-slide-down',
  slideLeft: 'translate-x-full animate-slide-left',
  slideRight: '-translate-x-full animate-slide-right'
} as const;

export const SCALE_ANIMATIONS = {
  scaleIn: 'scale-0 animate-scale-in',
  scaleOut: 'scale-100 animate-scale-out',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce'
} as const;

// Stagger delay utilities
export const getStaggerDelay = (index: number, baseDelay = 0, stagger = 100) => {
  return baseDelay + (index * stagger);
};

export const createStaggerStyle = (index: number, baseDelay = 0, stagger = 100) => ({
  animationDelay: `${getStaggerDelay(index, baseDelay, stagger)}ms`
});

// Animation state management
export type AnimationState = 'idle' | 'entering' | 'entered' | 'exiting' | 'exited';

export const getAnimationClasses = (
  state: AnimationState,
  animation: keyof typeof FADE_ANIMATIONS = 'fadeInUp'
) => {
  switch (state) {
    case 'entering':
    case 'entered':
      return `opacity-100 translate-y-0 transition-all duration-700 ease-out`;
    case 'exiting':
    case 'exited':
      return FADE_ANIMATIONS[animation];
    default:
      return FADE_ANIMATIONS[animation];
  }
};

// Scroll-based animation utilities
export const SCROLL_ANIMATION_CONFIG = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
  triggerOnce: true
} as const;

export const PARALLAX_SPEEDS = {
  slow: 0.2,
  normal: 0.5,
  fast: 0.8,
  faster: 1.2
} as const;

// Performance optimization for animations
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getAnimationProps = (reduceMotion = false) => {
  if (reduceMotion || shouldReduceMotion()) {
    return {
      duration: 0,
      delay: 0,
      transition: 'none'
    };
  }
  
  return {
    duration: ANIMATION_DURATIONS.normal,
    delay: 0,
    transition: `all ${ANIMATION_DURATIONS.normal}ms ${ANIMATION_EASINGS.easeOut}`
  };
};