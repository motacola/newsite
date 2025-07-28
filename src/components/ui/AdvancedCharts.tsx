'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';

// Animated Counter Component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const { elementRef, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(value * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, isVisible]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}

// Progress Ring Component
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  className?: string;
  animated?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  className = '',
  animated = true
}: ProgressRingProps) {
  const { elementRef, isVisible } = useScrollAnimation();
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    if (!isVisible || !animated) {
      setAnimatedProgress(progress);
      return;
    }

    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 200);

    return () => clearTimeout(timer);
  }, [progress, isVisible, animated]);

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedCounter
            value={progress}
            suffix="%"
            className="text-lg font-semibold text-gray-900"
          />
        </div>
      )}
    </div>
  );
}

// Donut Chart Component
interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  centerContent?: React.ReactNode;
  className?: string;
}

export function DonutChart({
  data,
  size = 200,
  strokeWidth = 20,
  showLegend = true,
  centerContent,
  className = ''
}: DonutChartProps) {
  const { elementRef, isVisible } = useScrollAnimation();
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  let cumulativePercentage = 0;

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage * circumference / 100} ${circumference}`;
            const strokeDashoffset = -cumulativePercentage * circumference / 100;
            
            cumulativePercentage += percentage;

            return (
              <motion.circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={hoveredSegment === index ? strokeWidth + 4 : strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={isVisible ? { strokeDasharray } : {}}
                transition={{ duration: 1.5, delay: index * 0.2 }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>
        
        {centerContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            {centerContent}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                hoveredSegment === index ? 'bg-gray-100' : ''
              }`}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.label}</span>
              <span className="font-medium text-gray-900">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Interactive Process Flow
interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'upcoming';
}

interface ProcessFlowProps {
  steps: ProcessStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ProcessFlow({
  steps,
  orientation = 'horizontal',
  className = ''
}: ProcessFlowProps) {
  const { elementRef, isVisible } = useScrollAnimation();
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const statusColors = {
    completed: 'bg-green-500 text-white',
    current: 'bg-blue-500 text-white',
    upcoming: 'bg-gray-300 text-gray-600'
  };

  const connectorColors = {
    completed: 'bg-green-500',
    current: 'bg-blue-500',
    upcoming: 'bg-gray-300'
  };

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row items-center'} space-${orientation === 'vertical' ? 'y' : 'x'}-4`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              onMouseEnter={() => setActiveStep(step.id)}
              onMouseLeave={() => setActiveStep(null)}
            >
              {/* Step circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300 cursor-pointer
                  ${statusColors[step.status || 'upcoming']}
                  ${activeStep === step.id ? 'scale-110 shadow-lg' : ''}
                `}
              >
                {step.icon || (index + 1)}
              </div>

              {/* Step content */}
              <div className={`mt-2 text-center ${orientation === 'horizontal' ? 'max-w-32' : 'max-w-48'}`}>
                <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{step.description}</p>
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {activeStep === step.id && (
                  <motion.div
                    className="absolute z-10 bottom-full mb-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {step.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <motion.div
                className={`
                  ${orientation === 'horizontal' ? 'h-0.5 w-8' : 'w-0.5 h-8'}
                  ${connectorColors[step.status || 'upcoming']}
                  transition-colors duration-300
                `}
                initial={{ scaleX: orientation === 'horizontal' ? 0 : 1, scaleY: orientation === 'vertical' ? 0 : 1 }}
                animate={isVisible ? { scaleX: 1, scaleY: 1 } : {}}
                transition={{ delay: (index + 0.5) * 0.2 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Metric Cards with Hover Effects
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  color = 'blue',
  className = ''
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <motion.div
      className={`
        relative p-6 bg-white rounded-xl shadow-soft border border-gray-200
        transition-all duration-300 cursor-pointer overflow-hidden
        ${className}
      `}
      whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Background gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-0`}
        animate={{ opacity: isHovered ? 0.05 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {icon && (
            <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? (
              <AnimatedCounter value={value} />
            ) : (
              value
            )}
          </div>

          {change && (
            <div className={`flex items-center text-sm ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1">
                {change.type === 'increase' ? '↗' : '↘'}
              </span>
              {change.value}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}