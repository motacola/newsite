'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { FocusManager, KEYBOARD_KEYS, isActivationKey, isNavigationKey } from '@/lib/accessibility';

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onTab?: (event: KeyboardEvent) => void;
  trapFocus?: boolean;
  autoFocus?: boolean;
  roving?: boolean; // Enable roving tabindex pattern
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean; // Whether navigation wraps around
  enabled?: boolean;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    onEscape,
    onEnter,
    onSpace,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onTab,
    trapFocus = false,
    autoFocus = false,
    roving = false,
    orientation = 'both',
    wrap = true,
    enabled = true,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const focusCleanupRef = useRef<(() => void) | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return FocusManager.getFocusableElements(containerRef.current);
  }, []);

  const updateRovingTabindex = useCallback((activeIndex: number) => {
    if (!roving) return;
    
    const focusableElements = getFocusableElements();
    focusableElements.forEach((element, index) => {
      element.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
    });
  }, [roving, getFocusableElements]);

  const moveFocus = useCallback((direction: 'next' | 'previous' | 'first' | 'last') => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    let newIndex = currentFocusIndex;

    switch (direction) {
      case 'next':
        newIndex = wrap 
          ? (currentFocusIndex + 1) % focusableElements.length
          : Math.min(currentFocusIndex + 1, focusableElements.length - 1);
        break;
      case 'previous':
        newIndex = wrap
          ? currentFocusIndex === 0 ? focusableElements.length - 1 : currentFocusIndex - 1
          : Math.max(currentFocusIndex - 1, 0);
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = focusableElements.length - 1;
        break;
    }

    if (newIndex !== currentFocusIndex) {
      setCurrentFocusIndex(newIndex);
      updateRovingTabindex(newIndex);
      focusableElements[newIndex]?.focus();
    }
  }, [currentFocusIndex, wrap, getFocusableElements, updateRovingTabindex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Mark as keyboard user
      setIsKeyboardUser(true);

      const { key } = event;

      // Handle activation keys
      if (isActivationKey(key)) {
        if (key === KEYBOARD_KEYS.ENTER && onEnter) {
          event.preventDefault();
          onEnter();
        } else if (key === KEYBOARD_KEYS.SPACE && onSpace) {
          event.preventDefault();
          onSpace();
        }
        return;
      }

      // Handle escape
      if (key === KEYBOARD_KEYS.ESCAPE && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle navigation keys
      if (isNavigationKey(key)) {
        event.preventDefault();

        switch (key) {
          case KEYBOARD_KEYS.ARROW_UP:
            if (orientation === 'vertical' || orientation === 'both') {
              if (onArrowUp) {
                onArrowUp();
              } else {
                moveFocus('previous');
              }
            }
            break;

          case KEYBOARD_KEYS.ARROW_DOWN:
            if (orientation === 'vertical' || orientation === 'both') {
              if (onArrowDown) {
                onArrowDown();
              } else {
                moveFocus('next');
              }
            }
            break;

          case KEYBOARD_KEYS.ARROW_LEFT:
            if (orientation === 'horizontal' || orientation === 'both') {
              if (onArrowLeft) {
                onArrowLeft();
              } else {
                moveFocus('previous');
              }
            }
            break;

          case KEYBOARD_KEYS.ARROW_RIGHT:
            if (orientation === 'horizontal' || orientation === 'both') {
              if (onArrowRight) {
                onArrowRight();
              } else {
                moveFocus('next');
              }
            }
            break;

          case KEYBOARD_KEYS.HOME:
            if (onHome) {
              onHome();
            } else {
              moveFocus('first');
            }
            break;

          case KEYBOARD_KEYS.END:
            if (onEnd) {
              onEnd();
            } else {
              moveFocus('last');
            }
            break;
        }
        return;
      }

      // Handle tab for focus trapping
      if (key === KEYBOARD_KEYS.TAB && trapFocus) {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (onTab) {
        onTab(event);
      }
    },
    [
      enabled, onEscape, onEnter, onSpace, onArrowUp, onArrowDown, onArrowLeft, onArrowRight,
      onHome, onEnd, onTab, trapFocus, orientation, moveFocus
    ]
  );

  const handleMouseDown = useCallback(() => {
    setIsKeyboardUser(false);
  }, []);

  const handleFocusIn = useCallback((event: FocusEvent) => {
    if (!roving) return;

    const focusableElements = getFocusableElements();
    const focusedIndex = focusableElements.indexOf(event.target as HTMLElement);
    
    if (focusedIndex !== -1) {
      setCurrentFocusIndex(focusedIndex);
      updateRovingTabindex(focusedIndex);
    }
  }, [roving, getFocusableElements, updateRovingTabindex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Set up focus trapping if enabled
    if (trapFocus) {
      FocusManager.saveFocus();
      focusCleanupRef.current = FocusManager.trapFocus(container);
    }

    // Set up roving tabindex if enabled
    if (roving) {
      updateRovingTabindex(currentFocusIndex);
    }

    // Auto focus first element if requested
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Add event listeners
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('focusin', handleFocusIn);

    // Add keyboard user class to container
    if (isKeyboardUser) {
      container.classList.add('keyboard-navigation');
    } else {
      container.classList.remove('keyboard-navigation');
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('focusin', handleFocusIn);
      container.classList.remove('keyboard-navigation');

      if (focusCleanupRef.current) {
        focusCleanupRef.current();
        focusCleanupRef.current = null;
      }

      if (trapFocus) {
        FocusManager.restoreFocus();
      }
    };
  }, [
    handleKeyDown, handleMouseDown, handleFocusIn, trapFocus, autoFocus, 
    roving, currentFocusIndex, updateRovingTabindex, getFocusableElements, isKeyboardUser, enabled
  ]);

  const focusFirst = useCallback(() => {
    moveFocus('first');
  }, [moveFocus]);

  const focusLast = useCallback(() => {
    moveFocus('last');
  }, [moveFocus]);

  const focusNext = useCallback(() => {
    moveFocus('next');
  }, [moveFocus]);

  const focusPrevious = useCallback(() => {
    moveFocus('previous');
  }, [moveFocus]);

  const focusIndex = useCallback((index: number) => {
    const focusableElements = getFocusableElements();
    if (index >= 0 && index < focusableElements.length) {
      setCurrentFocusIndex(index);
      updateRovingTabindex(index);
      focusableElements[index].focus();
    }
  }, [getFocusableElements, updateRovingTabindex]);

  return {
    containerRef,
    currentFocusIndex,
    isKeyboardUser,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusIndex,
    getFocusableElements,
  };
}

// Legacy compatibility - keep existing interfaces
interface FocusManagementOptions {
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
}

export function useFocusManagement(options: FocusManagementOptions = {}) {
  const { autoFocus = false, restoreFocus = false, trapFocus = false } = options;
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        firstFocusable.focus();
      }
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [autoFocus, restoreFocus]);

  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [trapFocus]);

  return { containerRef };
}

// Hook for managing focus indicators
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let hadKeyboardEvent = false;

    const onKeyDown = () => {
      hadKeyboardEvent = true;
    };

    const onMouseDown = () => {
      hadKeyboardEvent = false;
    };

    const onFocus = () => {
      if (hadKeyboardEvent) {
        setIsFocusVisible(true);
      }
    };

    const onBlur = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    element.addEventListener('focus', onFocus);
    element.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
      element.removeEventListener('focus', onFocus);
      element.removeEventListener('blur', onBlur);
    };
  }, []);

  return { elementRef, isFocusVisible };
}