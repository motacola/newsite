'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ProjectMetric } from '@/lib/types';

interface MetricsDisplayProps {
  metrics: ProjectMetric[];
  variant?: 'default' | 'compact' | 'detailed';
  animated?: boolean;
  showComparison?: boolean;
}

// Icon mapping for common metric types
const iconMap: Record<string, string> = {
  users: '👥',
  target: '🎯',
  clock: '⏱️',
  'trending-up': '📈',
  'bar-chart': '📊',
  'dollar-sign': '💰',
  zap: '⚡',
  'check-circle': '✅',
  film: '🎬'
};

function AnimatedCounter({ 
  value, 
  duration = 2000 
}: { 
  value: string; 
  duration?: number; 
}) {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    // Extract numeric value and suffix
    const numericMatch = value.match(/^(\d+(?:\.\d+)?)/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    
    const targetNumber = parseFloat(numericMatch[1]);
    const suffix = value.replace(numericMatch[1], '');
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = targetNumber * easeOutQuart;
      
      // Format the number appropriately
      const formattedValue = targetNumber % 1 === 0 
        ? Math.floor(currentValue).toString()
        : currentValue.toFixed(1);
      
      setDisplayValue(formattedValue + suffix);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [value, duration]);
  
  return <span>{displayValue}</span>;
}

export function MetricsDisplay({ 
  metrics, 
  variant = 'default',
  animated = true,
  showComparison: _showComparison = false
}: MetricsDisplayProps) {
  const [inView, setInView] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25
      }
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {metrics.slice(0, 3).map((metric, index) => (
          <div key={index} className="flex-shrink-0 text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {animated ? <AnimatedCounter value={metric.value} /> : metric.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {metric.label}
            </div>
            {metric.improvement && (
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                {metric.improvement}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        Project Impact
      </h4>
      
      <motion.div
        className={`
          grid gap-4
          ${variant === 'detailed' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}
        `}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onViewportEnter={() => setInView(true)}
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            className={`
              p-4 rounded-lg border border-gray-200 dark:border-gray-700
              bg-gradient-to-br from-white to-gray-50 
              dark:from-gray-800 dark:to-gray-900
              hover:shadow-lg transition-shadow duration-300
              ${variant === 'detailed' ? 'p-6' : ''}
            `}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            {/* Icon */}
            {metric.icon && (
              <div className="text-2xl mb-2">
                {iconMap[metric.icon] || '📊'}
              </div>
            )}
            
            {/* Value */}
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {animated && inView ? (
                <AnimatedCounter value={metric.value} />
              ) : (
                metric.value
              )}
            </div>
            
            {/* Label */}
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {metric.label}
            </div>
            
            {/* Improvement */}
            {metric.improvement && (
              <div className="flex items-center gap-1">
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  {metric.improvement}
                </span>
                <motion.span
                  className="text-green-600 dark:text-green-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  ↗️
                </motion.span>
              </div>
            )}
            
            {/* Category Badge */}
            {metric.category && variant === 'detailed' && (
              <div className="mt-2">
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${metric.category === 'performance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                  ${metric.category === 'engagement' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
                  ${metric.category === 'business' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                  ${metric.category === 'technical' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : ''}
                `}>
                  {metric.category}
                </span>
              </div>
            )}

            {/* Description */}
            {metric.description && variant === 'detailed' && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {metric.description}
                </div>
              </div>
            )}

            {/* Trend Indicator */}
            {metric.trend && (
              <div className="absolute top-2 right-2">
                <span className={`
                  text-xs
                  ${metric.trend === 'up' ? 'text-green-500' : ''}
                  ${metric.trend === 'down' ? 'text-red-500' : ''}
                  ${metric.trend === 'stable' ? 'text-gray-500' : ''}
                `}>
                  {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '➡️'}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
      
      {variant === 'detailed' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Impact Summary
          </h5>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This project delivered measurable improvements across {metrics.length} key metrics,
            demonstrating significant value in user engagement, performance, and business outcomes.
          </p>
        </div>
      )}
    </div>
  );
}