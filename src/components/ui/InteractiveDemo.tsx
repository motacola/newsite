'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveDemoProps } from '@/lib/types';
import { Button } from './Button';

export function InteractiveDemo({ 
  interactive, 
  title: _title, 
  onLaunch 
}: InteractiveDemoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset iframe loaded state when URL changes
  useEffect(() => {
    setIframeLoaded(false);
  }, [interactive?.url]);

  if (!interactive) {
    return null;
  }

  const handleLaunch = async () => {
    setIsLoading(true);
    onLaunch?.();
    
    if (interactive.url) {
      // Add a small delay to show loading state
      setTimeout(() => {
        window.open(interactive.url, '_blank');
        setIsLoading(false);
      }, 500);
    } else {
      setIsLoading(false);
    }
  };

  const handleEmbedToggle = () => {
    setIsEmbedded(!isEmbedded);
    if (!isEmbedded) {
      setIframeLoaded(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const getDemoTypeIcon = (type: string) => {
    switch (type) {
      case 'demo':
        return '🚀';
      case 'visualization':
        return '📊';
      case 'comparison':
        return '⚖️';
      default:
        return '🔗';
    }
  };

  const getDemoTypeDescription = (type: string) => {
    switch (type) {
      case 'demo':
        return 'Experience the live interactive demonstration';
      case 'visualization':
        return 'Explore data visualizations and insights';
      case 'comparison':
        return 'Compare before and after implementations';
      default:
        return 'Access the interactive content';
    }
  };

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-3xl">
          {getDemoTypeIcon(interactive.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Interactive {interactive.type.charAt(0).toUpperCase() + interactive.type.slice(1)} Available
          </h4>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {getDemoTypeDescription(interactive.type)}
          </p>
          
          {/* Demo Features */}
          <div className="space-y-2 mb-4">
            {interactive.type === 'demo' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Live interactive experience
              </div>
            )}
            {interactive.type === 'visualization' && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Dynamic data visualizations
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Interactive charts and graphs
                </div>
              </>
            )}
            {interactive.type === 'comparison' && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Before/after comparisons
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Performance metrics analysis
                </div>
              </>
            )}
          </div>
          
          {/* Embedded Content Preview */}
          {interactive.embedCode && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Preview Available
              </div>
              <div 
                className="text-sm text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: interactive.embedCode }}
              />
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleLaunch}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Loading...
                </>
              ) : (
                <>
                  <span>Launch {interactive.type}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </>
              )}
            </Button>

            {/* Embed Toggle Button */}
            {interactive.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmbedToggle}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {isEmbedded ? 'Hide Preview' : 'Show Preview'}
              </Button>
            )}
            
            {interactive.url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(interactive.url || '')}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Demo Section */}
      <AnimatePresence>
        {isEmbedded && interactive.url && (
          <motion.div
            className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                Live Preview
              </h5>
              
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                {/* Loading State */}
                <AnimatePresence>
                  {!iframeLoaded && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <motion.div
                          className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Loading interactive demo...
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Iframe */}
                <iframe
                  ref={iframeRef}
                  src={interactive.url}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  title={`Interactive ${interactive.type} demo`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="lazy"
                />

                {/* Overlay Controls */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => window.open(interactive.url, '_blank')}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    title="Open in new tab"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleEmbedToggle}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    title="Close preview"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Demo Info */}
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>Interactive demo embedded above</span>
                <span className={`flex items-center gap-1 ${iframeLoaded ? 'text-green-600' : 'text-yellow-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${iframeLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  {iframeLoaded ? 'Loaded' : 'Loading'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}