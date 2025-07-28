import { useEffect, useState } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

interface ScrollAnimationConfig {
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: number;
  rootMargin?: string;
}

export function useScrollAnimation(config: ScrollAnimationConfig = {}) {
  const {
    delay = 0,
    duration = 600,
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px'
  } = config;

  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const [animationState, setAnimationState] = useState<'idle' | 'animating' | 'complete'>('idle');

  useEffect(() => {
    if (isIntersecting && animationState === 'idle') {
      setAnimationState('animating');
      
      const timer = setTimeout(() => {
        setAnimationState('complete');
      }, delay + duration);

      return () => clearTimeout(timer);
    }
  }, [isIntersecting, animationState, delay, duration]);

  return {
    elementRef,
    isVisible: isIntersecting,
    animationState,
    animationClasses: {
      initial: 'opacity-0 translate-y-8',
      animate: isIntersecting 
        ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out'
        : 'opacity-0 translate-y-8',
      complete: 'opacity-100 translate-y-0'
    },
    style: {
      transitionDelay: `${delay}ms`,
      transitionDuration: `${duration}ms`
    }
  };
}

export function useStaggeredAnimation(itemCount: number, config: ScrollAnimationConfig = {}) {
  const { stagger = 100, ...restConfig } = config;
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: restConfig.threshold || 0.1,
    rootMargin: restConfig.rootMargin || '0px 0px -50px 0px',
    triggerOnce: true
  });

  const getItemDelay = (index: number) => {
    return (restConfig.delay || 0) + (index * stagger);
  };

  const getItemClasses = (index: number) => {
    const delay = getItemDelay(index);
    return {
      initial: 'opacity-0 translate-y-8',
      animate: isIntersecting 
        ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out'
        : 'opacity-0 translate-y-8',
      style: {
        transitionDelay: `${delay}ms`,
        transitionDuration: `${restConfig.duration || 600}ms`
      }
    };
  };

  return {
    containerRef: elementRef,
    isVisible: isIntersecting,
    getItemAnimation: getItemClasses
  };
}