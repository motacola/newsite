'use client';

import React from 'react';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { ParallaxBackground } from './ParallaxBackground';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'slide-up';
  delay?: number;
  duration?: number;
  threshold?: number;
  parallax?: {
    enabled: boolean;
    speed?: number;
    direction?: 'up' | 'down';
  };
  background?: {
    type: 'gradient' | 'image' | 'video';
    src?: string;
    overlay?: boolean;
  };
}

export function AnimatedSection({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.1,
  parallax,
  background
}: AnimatedSectionProps) {
  const { elementRef, isVisible, style } = useScrollAnimation({
    delay,
    duration,
    threshold
  });

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

  const variant = animationVariants[animation];

  const sectionContent = (
    <section
      ref={elementRef}
      className={`relative ${variant.initial} ${isVisible ? variant.animate : ''} ${className}`}
      style={{
        ...style,
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {background && (
        <div className="absolute inset-0 -z-10">
          {background.type === 'gradient' && (
            <div className="absolute inset-0 bg-gradient-hero" />
          )}
          {background.type === 'image' && background.src && (
            <img
              src={background.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {background.type === 'video' && background.src && (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={background.src} type="video/mp4" />
            </video>
          )}
          {background.overlay && (
            <div className="absolute inset-0 bg-black/30" />
          )}
        </div>
      )}
      {children}
    </section>
  );

  if (parallax?.enabled) {
    return (
      <ParallaxBackground
        speed={parallax.speed}
        direction={parallax.direction}
        className="relative"
      >
        {sectionContent}
      </ParallaxBackground>
    );
  }

  return sectionContent;
}

interface AnimatedGridProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  stagger?: number;
  delay?: number;
  animation?: 'fade-up' | 'fade-down' | 'scale';
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function AnimatedGrid({
  children,
  className = '',
  itemClassName = '',
  stagger = 100,
  delay = 0,
  animation = 'fade-up',
  columns = { default: 1, md: 2, lg: 3 }
}: AnimatedGridProps) {
  const { elementRef, isVisible } = useScrollAnimation({ delay });

  const animationVariants = {
    'fade-up': {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    'fade-down': {
      initial: 'opacity-0 -translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    'scale': {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100'
    }
  };

  const variant = animationVariants[animation];

  const getGridClasses = () => {
    const baseClasses = 'grid gap-6';
    const colClasses = [
      `grid-cols-${columns.default}`,
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`
    ].filter(Boolean).join(' ');
    
    return `${baseClasses} ${colClasses}`;
  };

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={`${getGridClasses()} ${className}`}>
      {children.map((child, index) => {
        const itemDelay = delay + (index * stagger);
        return (
          <div
            key={index}
            className={`${variant.initial} ${isVisible ? variant.animate : ''} ${itemClassName}`}
            style={{
              transitionDelay: `${itemDelay}ms`,
              transitionDuration: '700ms',
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