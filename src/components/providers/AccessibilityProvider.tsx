'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getReducedMotionPreference, 
  onReducedMotionChange, 
  isHighContrastMode,
  LiveAnnouncer 
} from '@/lib/accessibility';

interface AccessibilityContextType {
  prefersReducedMotion: boolean;
  isHighContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [liveAnnouncer, setLiveAnnouncer] = useState<LiveAnnouncer | null>(null);

  useEffect(() => {
    // Initialize reduced motion preference
    setPrefersReducedMotion(getReducedMotionPreference());

    // Initialize high contrast detection
    setIsHighContrast(isHighContrastMode());

    // Initialize live announcer
    const announcer = LiveAnnouncer.getInstance();
    setLiveAnnouncer(announcer);

    // Load saved font size preference
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large';
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    // Set up reduced motion change listener
    const unsubscribeReducedMotion = onReducedMotionChange(setPrefersReducedMotion);

    // Set up high contrast change listener
    const handleHighContrastChange = () => {
      setIsHighContrast(isHighContrastMode());
    };

    // Listen for system theme changes that might affect high contrast
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addEventListener('change', handleHighContrastChange);

    // Apply accessibility classes to document
    updateDocumentClasses();

    return () => {
      unsubscribeReducedMotion();
      mediaQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  useEffect(() => {
    updateDocumentClasses();
    // Save font size preference
    localStorage.setItem('accessibility-font-size', fontSize);
  }, [prefersReducedMotion, isHighContrast, fontSize]);

  const updateDocumentClasses = () => {
    const html = document.documentElement;
    
    // Reduced motion class
    if (prefersReducedMotion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }

    // High contrast class
    if (isHighContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    // Font size class
    html.classList.remove('font-small', 'font-medium', 'font-large');
    html.classList.add(`font-${fontSize}`);
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveAnnouncer) {
      liveAnnouncer.announce(message, priority);
    }
  };

  const handleSetFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    announceToScreenReader(`Font size changed to ${size}`);
  };

  const value: AccessibilityContextType = {
    prefersReducedMotion,
    isHighContrast,
    fontSize,
    announceToScreenReader,
    setFontSize: handleSetFontSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}