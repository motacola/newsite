'use client';

import React from 'react';
import { useParallax } from '@/lib/hooks/useParallax';

interface ParallaxBackgroundProps {
  children?: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
  disabled?: boolean;
}

export function ParallaxBackground({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  disabled = false
}: ParallaxBackgroundProps) {
  const { elementRef, style } = useParallax({ speed, direction, disabled });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed: number;
  direction?: 'up' | 'down';
  className?: string;
  zIndex?: number;
}

export function ParallaxLayer({
  children,
  speed,
  direction = 'up',
  className = '',
  zIndex = 0
}: ParallaxLayerProps) {
  const { elementRef, style } = useParallax({ speed, direction });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`absolute inset-0 ${className}`}
      style={{
        ...style,
        zIndex
      }}
    >
      {children}
    </div>
  );
}

interface ParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
}

export function ParallaxContainer({
  children,
  className = '',
  height = 'h-screen'
}: ParallaxContainerProps) {
  return (
    <div className={`relative overflow-hidden ${height} ${className}`}>
      {children}
    </div>
  );
}