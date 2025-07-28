'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectMetric } from '@/lib/types';

interface InteractiveChartsProps {
  metrics: ProjectMetric[];
  title?: string;
  variant?: 'bar' | 'line' | 'comparison';
  animated?: boolean;
  showLegend?: boolean;
  className?: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  improvement?: number;
  color: string;
  category?: string;
}

export function InteractiveCharts({
  metrics,
  title = 'Performance Improvements',
  variant = 'bar',
  animated = true,
  showLegend = true,
  className = ''
}: InteractiveChartsProps) {
  const [activeMetric, setActiveMetric] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const chartRef = useRef<SVGSVGElement>(null);

  // Process metrics data for chart visualization
  const chartData: ChartDataPoint[] = metrics.map((metric, index) => {
    const numericValue = parseFloat(metric.value.replace(/[^\d.]/g, ''));
    const improvementValue = metric.improvement 
      ? parseFloat(metric.improvement.replace(/[^\d.]/g, ''))
      : 0;

    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
    ];

    return {
      label: metric.label,
      value: numericValue,
      improvement: improvementValue,
      color: colors[index % colors.length],
      category: metric.category
    };
  });

  const maxValue = Math.max(...chartData.map(d => d.value));

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(1);
    }
  }, [animated]);

  const BarChart = () => (
    <div className="space-y-4">
      {chartData.map((data, index) => (
        <motion.div
          key={index}
          className="relative"
          onHoverStart={() => setActiveMetric(index)}
          onHoverEnd={() => setActiveMetric(null)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {data.label}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {metrics[index].value}
            </span>
          </div>
          
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: data.color }}
              initial={{ width: 0 }}
              animate={{ 
                width: `${(data.value / maxValue) * 100 * animationProgress}%` 
              }}
              transition={{ 
                duration: 1.5, 
                delay: index * 0.2,
                ease: 'easeOut'
              }}
            />
            
            {/* Improvement indicator */}
            {data.improvement && data.improvement > 0 && (
              <motion.div
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-white"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.2 }}
              >
                +{data.improvement}%
              </motion.div>
            )}
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {activeMetric === index && (
              <motion.div
                className="absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="font-medium">{data.label}</div>
                <div>Value: {metrics[index].value}</div>
                {metrics[index].improvement && (
                  <div className="text-green-400">
                    Improvement: {metrics[index].improvement}
                  </div>
                )}
                {metrics[index].description && (
                  <div className="text-xs text-gray-300 mt-1">
                    {metrics[index].description}
                  </div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );

  const ComparisonChart = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {chartData.map((data, index) => (
        <motion.div
          key={index}
          className="relative p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.02 }}
          onHoverStart={() => setActiveMetric(index)}
          onHoverEnd={() => setActiveMetric(null)}
        >
          <div className="text-center mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {data.label}
            </h4>
          </div>

          <div className="flex items-end justify-center space-x-4 h-32">
            {/* Before Bar */}
            <div className="flex flex-col items-center">
              <motion.div
                className="w-8 bg-red-400 rounded-t"
                initial={{ height: 0 }}
                animate={{ 
                  height: `${((data.value - (data.improvement || 0)) / data.value) * 100 * animationProgress}px` 
                }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Before
              </span>
            </div>

            {/* After Bar */}
            <div className="flex flex-col items-center">
              <motion.div
                className="w-8 rounded-t"
                style={{ backgroundColor: data.color }}
                initial={{ height: 0 }}
                animate={{ 
                  height: `${(data.value / maxValue) * 100 * animationProgress}px` 
                }}
                transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                After
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {metrics[index].value}
            </div>
            {data.improvement && data.improvement > 0 && (
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                +{data.improvement}% improvement
              </div>
            )}
          </div>

          {/* Category badge */}
          {data.category && (
            <div className="absolute top-2 right-2">
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${data.category === 'performance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                ${data.category === 'engagement' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
                ${data.category === 'business' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                ${data.category === 'technical' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : ''}
              `}>
                {data.category}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  const LineChart = () => (
    <div className="relative h-64 p-4">
      <svg
        ref={chartRef}
        className="w-full h-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Data line */}
        <motion.path
          d={`M 50,${180 - (chartData[0]?.value || 0) / maxValue * 150} ${chartData.map((data, index) => 
            `L ${50 + (index * 300 / (chartData.length - 1))},${180 - data.value / maxValue * 150}`
          ).join(' ')}`}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: animationProgress }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Data points */}
        {chartData.map((data, index) => (
          <motion.circle
            key={index}
            cx={50 + (index * 300 / (chartData.length - 1))}
            cy={180 - data.value / maxValue * 150}
            r="4"
            fill={data.color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5 + index * 0.1 }}
            className="cursor-pointer"
            onMouseEnter={() => setActiveMetric(index)}
            onMouseLeave={() => setActiveMetric(null)}
          />
        ))}

        {/* Labels */}
        {chartData.map((data, index) => (
          <text
            key={index}
            x={50 + (index * 300 / (chartData.length - 1))}
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400"
          >
            {data.label.split(' ')[0]}
          </text>
        ))}
      </svg>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        {variant === 'bar' && <BarChart />}
        {variant === 'comparison' && <ComparisonChart />}
        {variant === 'line' && <LineChart />}
      </div>

      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {chartData.map((data, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">
                {data.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}