'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div className={cn('relative', className)}>
      {/* Loading overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-white z-50 transition-opacity duration-300',
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-center h-full">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>

      {/* Page content */}
      <div
        className={cn(
          'transition-all duration-500 ease-out',
          isLoading 
            ? 'opacity-0 translate-y-4 scale-95' 
            : 'opacity-100 translate-y-0 scale-100'
        )}
      >
        {displayChildren}
      </div>
    </div>
  );
}

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}

export function SectionTransition({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 600
}: SectionTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directions = {
    up: {
      initial: 'translate-y-8 opacity-0',
      animate: 'translate-y-0 opacity-100'
    },
    down: {
      initial: '-translate-y-8 opacity-0',
      animate: 'translate-y-0 opacity-100'
    },
    left: {
      initial: 'translate-x-8 opacity-0',
      animate: 'translate-x-0 opacity-100'
    },
    right: {
      initial: '-translate-x-8 opacity-0',
      animate: 'translate-x-0 opacity-100'
    }
  };

  const variant = directions[direction];

  return (
    <div
      className={cn(
        'transition-all ease-out',
        variant.initial,
        isVisible && variant.animate,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}

// Smooth scroll behavior hook
export function useSmoothScroll() {
  const scrollToElement = (elementId: string, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return { scrollToElement, scrollToTop };
}

// Intersection-based section transitions
interface IntersectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'scale';
}

export function IntersectionTransition({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  animation = 'slide-up'
}: IntersectionTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(elementRef);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, threshold, rootMargin]);

  const animations = {
    fade: {
      initial: 'opacity-0',
      animate: 'opacity-100'
    },
    'slide-up': {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    'slide-left': {
      initial: 'opacity-0 translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    scale: {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100'
    }
  };

  const variant = animations[animation];

  return (
    <div
      ref={setElementRef}
      className={cn(
        'transition-all duration-700 ease-out',
        variant.initial,
        isVisible && variant.animate,
        className
      )}
    >
      {children}
    </div>
  );
}