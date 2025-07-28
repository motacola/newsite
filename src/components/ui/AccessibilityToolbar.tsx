'use client';

import { useState } from 'react';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';
import { Button } from './Button';
import { 
  Settings, 
  Type, 
  Eye, 
  Volume2, 
  Keyboard,
  Contrast,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface AccessibilityToolbarProps {
  className?: string;
}

export function AccessibilityToolbar({ className = '' }: AccessibilityToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    fontSize, 
    setFontSize, 
    prefersReducedMotion, 
    isHighContrast,
    announceToScreenReader 
  } = useAccessibility();

  const handleToggleToolbar = () => {
    setIsOpen(!isOpen);
    announceToScreenReader(
      isOpen ? 'Accessibility toolbar closed' : 'Accessibility toolbar opened'
    );
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  };

  const handleToggleHighContrast = () => {
    const html = document.documentElement;
    const isCurrentlyHighContrast = html.classList.contains('high-contrast');
    
    if (isCurrentlyHighContrast) {
      html.classList.remove('high-contrast');
      announceToScreenReader('High contrast mode disabled');
    } else {
      html.classList.add('high-contrast');
      announceToScreenReader('High contrast mode enabled');
    }
  };

  const handleToggleReducedMotion = () => {
    const html = document.documentElement;
    const isCurrentlyReduced = html.classList.contains('reduce-motion');
    
    if (isCurrentlyReduced) {
      html.classList.remove('reduce-motion');
      announceToScreenReader('Animations enabled');
    } else {
      html.classList.add('reduce-motion');
      announceToScreenReader('Animations reduced');
    }
  };

  const handleResetSettings = () => {
    setFontSize('medium');
    const html = document.documentElement;
    html.classList.remove('high-contrast', 'reduce-motion');
    announceToScreenReader('Accessibility settings reset to default');
  };

  const handleKeyboardShortcuts = () => {
    announceToScreenReader('Keyboard shortcuts: Tab to navigate, Enter or Space to activate, Escape to close dialogs');
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Toolbar Toggle Button */}
      <Button
        onClick={handleToggleToolbar}
        variant="secondary"
        size="sm"
        className="mb-2 shadow-lg"
        aria-label={isOpen ? 'Close accessibility toolbar' : 'Open accessibility toolbar'}
        aria-expanded={isOpen}
        aria-controls="accessibility-toolbar"
      >
        <Settings className="w-4 h-4" />
        <span className="sr-only">Accessibility Settings</span>
      </Button>

      {/* Toolbar Panel */}
      {isOpen && (
        <div
          id="accessibility-toolbar"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80"
          role="dialog"
          aria-label="Accessibility Settings"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Accessibility</h3>
              <Button
                onClick={handleToggleToolbar}
                variant="ghost"
                size="sm"
                aria-label="Close accessibility toolbar"
              >
                ×
              </Button>
            </div>

            {/* Font Size Controls */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Type className="w-4 h-4 inline mr-2" />
                Font Size
              </label>
              <div className="flex gap-2" role="radiogroup" aria-label="Font size options">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <Button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    variant={fontSize === size ? 'primary' : 'secondary'}
                    size="sm"
                    role="radio"
                    aria-checked={fontSize === size}
                    aria-label={`Set font size to ${size}`}
                  >
                    {size === 'small' && <ZoomOut className="w-3 h-3" />}
                    {size === 'medium' && <Type className="w-3 h-3" />}
                    {size === 'large' && <ZoomIn className="w-3 h-3" />}
                    <span className="ml-1 capitalize">{size}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="space-y-2">
              <Button
                onClick={handleToggleHighContrast}
                variant={isHighContrast ? 'primary' : 'secondary'}
                size="sm"
                className="w-full justify-start"
                aria-pressed={isHighContrast}
                aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
              >
                <Contrast className="w-4 h-4 mr-2" />
                High Contrast
                <span className="ml-auto text-xs">
                  {isHighContrast ? 'ON' : 'OFF'}
                </span>
              </Button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="space-y-2">
              <Button
                onClick={handleToggleReducedMotion}
                variant={prefersReducedMotion ? 'primary' : 'secondary'}
                size="sm"
                className="w-full justify-start"
                aria-pressed={prefersReducedMotion}
                aria-label={`${prefersReducedMotion ? 'Enable' : 'Disable'} animations`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Reduce Motion
                <span className="ml-auto text-xs">
                  {prefersReducedMotion ? 'ON' : 'OFF'}
                </span>
              </Button>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="space-y-2">
              <Button
                onClick={handleKeyboardShortcuts}
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                aria-label="Announce keyboard shortcuts"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Keyboard Shortcuts
              </Button>
            </div>

            {/* Reset Settings */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleResetSettings}
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                aria-label="Reset all accessibility settings to default"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Settings
              </Button>
            </div>

            {/* Status Information */}
            <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p>Current settings:</p>
              <ul className="mt-1 space-y-1">
                <li>Font size: {fontSize}</li>
                <li>High contrast: {isHighContrast ? 'enabled' : 'disabled'}</li>
                <li>Reduced motion: {prefersReducedMotion ? 'enabled' : 'disabled'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}