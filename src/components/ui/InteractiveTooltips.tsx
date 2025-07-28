'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  offset?: number;
  className?: string;
  interactive?: boolean;
  maxWidth?: number;
}

export function InteractiveTooltip({
  children,
  content,
  position = 'auto',
  delay = 300,
  offset = 8,
  className = '',
  interactive = false,
  maxWidth = 300
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = 0;
    let y = 0;
    let finalPosition = position;

    if (position === 'auto') {
      // Determine best position based on available space
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      if (spaceTop > spaceBottom && spaceTop > 100) {
        finalPosition = 'top';
      } else if (spaceBottom > 100) {
        finalPosition = 'bottom';
      } else if (spaceRight > spaceLeft && spaceRight > maxWidth) {
        finalPosition = 'right';
      } else {
        finalPosition = 'left';
      }
    }

    switch (finalPosition) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.top - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - offset;
        y = triggerRect.top + triggerRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2;
        break;
    }

    setTooltipPosition({ x, y });
    setActualPosition(finalPosition as 'top' | 'bottom' | 'left' | 'right');
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!interactive) {
      setIsVisible(false);
    } else {
      // Delay hiding for interactive tooltips
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  };

  const handleTooltipEnter = () => {
    if (interactive && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleTooltipLeave = () => {
    if (interactive) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: `${maxWidth}px`,
      pointerEvents: interactive ? 'auto' : 'none'
    };

    switch (actualPosition) {
      case 'top':
        return {
          ...baseStyle,
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          ...baseStyle,
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          ...baseStyle,
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          ...baseStyle,
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(0, -50%)'
        };
      default:
        return baseStyle;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-0 h-0 border-4 border-transparent';
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} border-t-gray-900 top-full left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} border-b-gray-900 bottom-full left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} border-l-gray-900 left-full top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} border-r-gray-900 right-full top-1/2 transform -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              style={getTooltipStyle()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={handleTooltipEnter}
              onMouseLeave={handleTooltipLeave}
            >
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm relative">
                {content}
                <div className={getArrowClasses()} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// Hover Card Component
interface HoverCardProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  delay?: number;
  width?: number;
}

export function HoverCard({
  children,
  content,
  className = '',
  delay = 200,
  width = 320
}: HoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    let x = rect.left + rect.width / 2;
    const y = rect.bottom + 8;

    // Adjust if card would go off screen
    if (x + width / 2 > viewportWidth) {
      x = viewportWidth - width / 2 - 16;
    }
    if (x - width / 2 < 0) {
      x = width / 2 + 16;
    }

    setPosition({ x, y });
  };

  const showCard = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const hideCard = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={showCard}
        onMouseLeave={hideCard}
      >
        {children}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                transform: 'translateX(-50%)',
                zIndex: 9999,
                width: `${width}px`
              }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                {content}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// Info Popover Component
interface InfoPopoverProps {
  children: React.ReactNode;
  title?: string;
  description: string;
  className?: string;
}

export function InfoPopover({
  children,
  title,
  description,
  className = ''
}: InfoPopoverProps) {
  return (
    <InteractiveTooltip
      content={
        <div className="space-y-2">
          {title && <div className="font-medium text-white">{title}</div>}
          <div className="text-gray-200 text-xs leading-relaxed">{description}</div>
        </div>
      }
      interactive={true}
      maxWidth={250}
      className={className}
    >
      {children}
    </InteractiveTooltip>
  );
}

// Quick Actions Tooltip
interface QuickActionsProps {
  children: React.ReactNode;
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'danger';
  }>;
  className?: string;
}

export function QuickActions({
  children,
  actions,
  className = ''
}: QuickActionsProps) {
  const colorClasses = {
    primary: 'hover:bg-blue-50 hover:text-blue-600',
    secondary: 'hover:bg-gray-50 hover:text-gray-700',
    danger: 'hover:bg-red-50 hover:text-red-600'
  };

  return (
    <InteractiveTooltip
      content={
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                w-full px-3 py-2 text-left text-sm flex items-center space-x-2
                transition-colors duration-150
                ${colorClasses[action.color || 'secondary']}
              `}
            >
              {action.icon && <span className="w-4 h-4">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      }
      interactive={true}
      position="bottom"
      className={className}
    >
      {children}
    </InteractiveTooltip>
  );
}