'use client';

import React from 'react';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';

interface TextRevealProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  animation?: 'fade' | 'slide-up' | 'typewriter';
  splitBy?: 'word' | 'character' | 'line';
}

export function TextReveal({
  text,
  delay = 0,
  stagger = 50,
  className = '',
  animation = 'slide-up',
  splitBy = 'word'
}: TextRevealProps) {
  const { elementRef, isVisible } = useScrollAnimation({ delay });

  const splitText = () => {
    switch (splitBy) {
      case 'character':
        return text.split('');
      case 'line':
        return text.split('\n');
      case 'word':
      default:
        return text.split(' ');
    }
  };

  const textParts = splitText();

  const getAnimationClasses = (index: number) => {
    const itemDelay = delay + (index * stagger);
    
    switch (animation) {
      case 'fade':
        return {
          initial: 'opacity-0',
          animate: isVisible ? 'opacity-100' : 'opacity-0',
          style: { transitionDelay: `${itemDelay}ms` }
        };
      case 'typewriter':
        return {
          initial: 'opacity-0 w-0',
          animate: isVisible ? 'opacity-100 w-auto' : 'opacity-0 w-0',
          style: { transitionDelay: `${itemDelay}ms` }
        };
      case 'slide-up':
      default:
        return {
          initial: 'opacity-0 translate-y-4',
          animate: isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          style: { transitionDelay: `${itemDelay}ms` }
        };
    }
  };

  return (
    <span ref={elementRef as React.RefObject<HTMLSpanElement>} className={className}>
      {textParts.map((part, index) => {
        const animationProps = getAnimationClasses(index);
        return (
          <span
            key={index}
            className={`inline-block transition-all duration-700 ease-out ${animationProps.initial} ${animationProps.animate}`}
            style={animationProps.style}
          >
            {part}
            {splitBy === 'word' && index < textParts.length - 1 && ' '}
          </span>
        );
      })}
    </span>
  );
}

interface AnimatedHeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  delay?: number;
  animation?: 'slide-up' | 'fade' | 'scale';
}

export function AnimatedHeading({
  children,
  level = 2,
  className = '',
  delay = 0,
  animation = 'slide-up'
}: AnimatedHeadingProps) {
  const { elementRef, isVisible, style } = useScrollAnimation({ delay });

  const animationClasses = {
    'slide-up': {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    'fade': {
      initial: 'opacity-0',
      animate: 'opacity-100'
    },
    'scale': {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100'
    }
  };

  const variant = animationClasses[animation];
  const baseClasses = `transition-all duration-700 ease-out ${variant.initial} ${isVisible ? variant.animate : ''} ${className}`;

  const commonProps = {
    ref: elementRef as React.RefObject<HTMLHeadingElement>,
    className: baseClasses,
    style
  };

  switch (level) {
    case 1:
      return <h1 {...commonProps}>{children}</h1>;
    case 2:
      return <h2 {...commonProps}>{children}</h2>;
    case 3:
      return <h3 {...commonProps}>{children}</h3>;
    case 4:
      return <h4 {...commonProps}>{children}</h4>;
    case 5:
      return <h5 {...commonProps}>{children}</h5>;
    case 6:
      return <h6 {...commonProps}>{children}</h6>;
    default:
      return <h2 {...commonProps}>{children}</h2>;
  }
}