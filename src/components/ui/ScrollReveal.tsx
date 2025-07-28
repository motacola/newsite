'use client';

import React from 'react';
import { useScrollAnimation, useStaggeredAnimation } from '@/lib/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'slide-up';
  threshold?: number;
}

const animationVariants = {
  'fade-up': {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0'
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-8',
    animate: 'opacity-100 translate-y-0'
  },
  'fade-left': {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0'
  },
  'fade-right': {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0'
  },
  'scale': {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100'
  },
  'slide-up': {
    initial: 'opacity-0 translate-y-12',
    animate: 'opacity-100 translate-y-0'
  }
};

export function ScrollReveal({
  children,
  delay = 0,
  duration = 600,
  className = '',
  animation = 'fade-up',
  threshold = 0.1
}: ScrollRevealProps) {
  const { elementRef, isVisible, style } = useScrollAnimation({
    delay,
    duration,
    threshold
  });

  const variant = animationVariants[animation];

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`${variant.initial} ${isVisible ? variant.animate : ''} ${className}`}
      style={{
        ...style,
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredRevealProps {
  children: React.ReactNode[];
  stagger?: number;
  delay?: number;
  duration?: number;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'slide-up';
  threshold?: number;
}

export function StaggeredReveal({
  children,
  stagger = 100,
  delay = 0,
  duration = 600,
  className = '',
  animation = 'fade-up',
  threshold = 0.1
}: StaggeredRevealProps) {
  const { containerRef, isVisible, getItemAnimation } = useStaggeredAnimation(
    children.length,
    { stagger, delay, duration, threshold }
  );

  const variant = animationVariants[animation];

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className={className}>
      {children.map((child, index) => {
        const itemAnimation = getItemAnimation(index);
        return (
          <div
            key={index}
            className={`${variant.initial} ${isVisible ? variant.animate : ''}`}
            style={{
              ...itemAnimation.style,
              transitionProperty: 'opacity, transform',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}