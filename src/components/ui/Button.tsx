import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';
import { generateId } from '@/lib/accessibility';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
  glow?: boolean;
  loadingText?: string;
  describedBy?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled, 
    children, 
    icon,
    iconPosition = 'left',
    ripple = true,
    glow = false,
    loadingText,
    describedBy,
    onClick,
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = useState(false);
    const [rippleCoords, setRippleCoords] = useState<{ x: number; y: number } | null>(null);
    const { prefersReducedMotion, announceToScreenReader } = useAccessibility();
    const buttonId = generateId('button');

    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden';
    
    const variants = {
      primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-creative hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0',
      outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-creative hover:-translate-y-0.5 active:translate-y-0',
      ghost: 'text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 hover:-translate-y-0.5 active:bg-orange-500/20 active:translate-y-0',
      accent: 'bg-gradient-to-r from-purple-500 to-cyan-400 text-white hover:from-purple-600 hover:to-cyan-500 hover:scale-105 hover:-translate-y-0.5 active:scale-100 active:translate-y-0',
      gradient: 'bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-400 text-white hover:scale-105 hover:-translate-y-0.5 active:scale-100 active:translate-y-0',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-base rounded-lg',
      lg: 'h-12 px-6 text-lg rounded-xl',
      xl: 'h-14 px-8 text-xl rounded-2xl',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading && !prefersReducedMotion) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRippleCoords({ x, y });
        
        // Clear ripple after animation
        setTimeout(() => setRippleCoords(null), 600);
      }
      
      if (!prefersReducedMotion) {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
      }
      
      // Announce loading state to screen readers
      if (loading && loadingText) {
        announceToScreenReader(loadingText);
      }
      
      if (onClick) {
        onClick(e);
      }
    };

    const LoadingSpinner = () => (
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        id={buttonId}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'cursor-not-allowed',
          glow && !prefersReducedMotion && 'animate-pulse-glow',
          isPressed && !prefersReducedMotion && 'scale-95',
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        onClick={handleClick}
        aria-busy={loading}
        aria-describedby={describedBy}
        aria-live={loading ? 'polite' : undefined}
        {...props}
      >
        {/* Ripple effect */}
        {ripple && rippleCoords && !prefersReducedMotion && (
          <span
            className="absolute rounded-full bg-white/30 animate-ping"
            style={{
              left: rippleCoords.x - 10,
              top: rippleCoords.y - 10,
              width: 20,
              height: 20,
            }}
            aria-hidden="true"
          />
        )}
        
        {/* Content */}
        <span className="relative flex items-center justify-center gap-2">
          {loading && (
            <>
              <LoadingSpinner />
              <span className="sr-only">{loadingText || 'Loading...'}</span>
            </>
          )}
          {!loading && icon && iconPosition === 'left' && (
            <span aria-hidden="true">{icon}</span>
          )}
          <span>{children}</span>
          {!loading && icon && iconPosition === 'right' && (
            <span aria-hidden="true">{icon}</span>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };