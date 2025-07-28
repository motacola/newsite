'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Hover Card Component
interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverRotate?: number;
  glowColor?: string;
}

export function HoverCard({ 
  children, 
  className = '', 
  hoverScale = 1.02,
  hoverRotate = 0,
  glowColor = 'primary'
}: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const glowColors = {
    primary: 'hover:shadow-glow',
    accent: 'hover:shadow-glow-accent',
    none: ''
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out cursor-pointer',
        glowColors[glowColor as keyof typeof glowColors],
        className
      )}
      style={{
        transform: isHovered 
          ? `scale(${hoverScale}) rotate(${hoverRotate}deg)` 
          : 'scale(1) rotate(0deg)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
}

export function ProgressBar({
  value,
  max = 100,
  className = '',
  showLabel = false,
  animated = true,
  color = 'primary'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-primary-500',
    accent: 'bg-gradient-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            colors[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Loading Dots Component
interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function LoadingDots({ 
  size = 'md', 
  color = 'bg-primary-500',
  className = '' 
}: LoadingDotsProps) {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-full animate-bounce',
            sizes[size],
            color
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
}

// Skeleton Loader Component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animated = true
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    rectangular: { width: '100%', height: '8rem' },
    circular: { width: '3rem', height: '3rem' }
  };

  const finalWidth = width || defaultSizes[variant].width;
  const finalHeight = height || defaultSizes[variant].height;

  return (
    <div
      className={cn(
        'bg-gray-200',
        variants[variant],
        animated && 'animate-pulse',
        className
      )}
      style={{
        width: finalWidth,
        height: finalHeight
      }}
    />
  );
}

// Tooltip Component
interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 500,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  };

  return (
    <div 
      className={cn('relative inline-block', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg whitespace-nowrap transition-opacity duration-200',
            positions[position]
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-4',
              arrows[position]
            )}
          />
        </div>
      )}
    </div>
  );
}

// Focus Ring Component
interface FocusRingProps {
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'accent';
}

export function FocusRing({ 
  children, 
  className = '',
  color = 'primary'
}: FocusRingProps) {
  const colors = {
    primary: 'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
    accent: 'focus-within:ring-2 focus-within:ring-accent-purple focus-within:ring-offset-2'
  };

  return (
    <div className={cn('transition-all duration-200', colors[color], className)}>
      {children}
    </div>
  );
}

// Pulse Effect Component
interface PulseEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PulseEffect({
  children,
  className = '',
  color = 'bg-primary-500',
  size = 'md'
}: PulseEffectProps) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className={cn(
        'absolute top-0 right-0 rounded-full animate-ping',
        sizes[size],
        color
      )} />
      <div className={cn(
        'absolute top-0 right-0 rounded-full',
        sizes[size],
        color
      )} />
    </div>
  );
}