import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

// Display heading for hero sections
export const Display: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'h1' 
}) => (
  <Component className={cn('text-display font-bold text-gray-900 text-balance', className)}>
    {children}
  </Component>
);

// Section headings
export const Heading: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'h2' 
}) => (
  <Component className={cn('text-heading font-semibold text-gray-900 text-balance', className)}>
    {children}
  </Component>
);

// Subheadings
export const Subheading: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'h3' 
}) => (
  <Component className={cn('text-xl font-medium text-gray-800 text-balance', className)}>
    {children}
  </Component>
);

// Body text
export const Body: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'p' 
}) => (
  <Component className={cn('text-body text-gray-700 text-pretty', className)}>
    {children}
  </Component>
);

// Small text
export const Small: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'span' 
}) => (
  <Component className={cn('text-sm text-gray-600', className)}>
    {children}
  </Component>
);

// Caption text
export const Caption: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'span' 
}) => (
  <Component className={cn('text-xs text-gray-500 uppercase tracking-wide', className)}>
    {children}
  </Component>
);

// Lead text for introductions
export const Lead: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'p' 
}) => (
  <Component className={cn('text-lg text-gray-600 font-light leading-relaxed text-pretty', className)}>
    {children}
  </Component>
);

// Gradient text effect
export const GradientText: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'span' 
}) => (
  <Component className={cn('text-gradient font-semibold', className)}>
    {children}
  </Component>
);