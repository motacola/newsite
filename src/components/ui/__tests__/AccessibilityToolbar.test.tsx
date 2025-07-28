import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibilityToolbar } from '../AccessibilityToolbar';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock accessibility provider
const mockAccessibilityContext = {
  fontSize: 'normal',
  contrast: 'normal',
  reducedMotion: false,
  screenReader: false,
  increaseFontSize: jest.fn(),
  decreaseFontSize: jest.fn(),
  toggleHighContrast: jest.fn(),
  toggleReducedMotion: jest.fn(),
  toggleScreenReader: jest.fn(),
  resetSettings: jest.fn(),
};

jest.mock('../../providers/AccessibilityProvider', () => ({
  useAccessibility: () => mockAccessibilityContext,
}));

describe('AccessibilityToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders accessibility toolbar correctly', () => {
      render(<AccessibilityToolbar />);
      
      expect(screen.getByLabelText('Accessibility options')).toBeInTheDocument();
      expect(screen.getByText('Accessibility')).toBeInTheDocument();
    });

    it('renders all accessibility controls', () => {
      render(<AccessibilityToolbar />);
      
      // Open toolbar
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      expect(screen.getByLabelText('Increase font size')).toBeInTheDocument();
      expect(screen.getByLabelText('Decrease font size')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle high contrast')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle reduced motion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle screen reader mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset accessibility settings')).toBeInTheDocument();
    });

    it('shows current font size setting', () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Font Size: Normal')).toBeInTheDocument();
    });

    it('shows current contrast setting', () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Contrast: Normal')).toBeInTheDocument();
    });
  });

  describe('Font Size Controls', () => {
    it('increases font size when increase button is clicked', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const increaseButton = screen.getByLabelText('Increase font size');
      await userEvent.click(increaseButton);
      
      expect(mockAccessibilityContext.increaseFontSize).toHaveBeenCalled();
    });

    it('decreases font size when decrease button is clicked', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const decreaseButton = screen.getByLabelText('Decrease font size');
      await userEvent.click(decreaseButton);
      
      expect(mockAccessibilityContext.decreaseFontSize).toHaveBeenCalled();
    });

    it('shows updated font size after change', () => {
      mockAccessibilityContext.fontSize = 'large';
      
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Font Size: Large')).toBeInTheDocument();
    });
  });

  describe('Contrast Controls', () => {
    it('toggles high contrast when button is clicked', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const contrastButton = screen.getByLabelText('Toggle high contrast');
      await userEvent.click(contrastButton);
      
      expect(mockAccessibilityContext.toggleHighContrast).toHaveBeenCalled();
    });

    it('shows high contrast state when enabled', () => {
      mockAccessibilityContext.contrast = 'high';
      
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Contrast: High')).toBeInTheDocument();
      
      const contrastButton = screen.getByLabelText('Toggle high contrast');
      expect(contrastButton).toHaveClass('bg-primary-600');
    });
  });

  describe('Motion Controls', () => {
    it('toggles reduced motion when button is clicked', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const motionButton = screen.getByLabelText('Toggle reduced motion');
      await userEvent.click(motionButton);
      
      expect(mockAccessibilityContext.toggleReducedMotion).toHaveBeenCalled();
    });

    it('shows reduced motion state when enabled', () => {
      mockAccessibilityContext.reducedMotion = true;
      
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      const motionButton = screen.getByLabelText('Toggle reduced motion');
      expect(motionButton).toHaveClass('bg-primary-600');
      expect(screen.getByText('Reduced Motion: On')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Controls', () => {
    it('toggles screen reader mode when button is clicked', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const screenReaderButton = screen.getByLabelText('Toggle screen reader mode');
      await userEvent.click(screenReaderButton);
      
      expect(mockAccessibilityContext.toggleScreenReader).toHaveBeenCalled();
    });

    it('shows screen reader state when enabled', () => {
      mockAccessibilityContext.screenReader = true;
      
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      const screenReaderButton = screen.getByLabelText('Toggle screen reader mode');
      expect(screenReaderButton).toHaveClass('bg-primary-600');
      expect(screen.getByText('Screen Reader: On')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('resets all settings when reset button is clicked', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const resetButton = screen.getByLabelText('Reset accessibility settings');
      await userEvent.click(resetButton);
      
      expect(mockAccessibilityContext.resetSettings).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation through controls', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const increaseButton = screen.getByLabelText('Increase font size');
      const decreaseButton = screen.getByLabelText('Decrease font size');
      
      increaseButton.focus();
      expect(increaseButton).toHaveFocus();
      
      fireEvent.keyDown(increaseButton, { key: 'Tab' });
      expect(decreaseButton).toHaveFocus();
    });

    it('handles Enter and Space key activation', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const increaseButton = screen.getByLabelText('Increase font size');
      increaseButton.focus();
      
      fireEvent.keyDown(increaseButton, { key: 'Enter' });
      expect(mockAccessibilityContext.increaseFontSize).toHaveBeenCalled();
      
      fireEvent.keyDown(increaseButton, { key: ' ' });
      expect(mockAccessibilityContext.increaseFontSize).toHaveBeenCalledTimes(2);
    });

    it('closes toolbar on Escape key', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      expect(screen.getByLabelText('Increase font size')).toBeVisible();
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(screen.queryByLabelText('Increase font size')).not.toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<AccessibilityToolbar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(toggleButton).toHaveAttribute('aria-controls');
      
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper role and labeling', () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Accessibility controls');
    });

    it('provides live region updates for setting changes', async () => {
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      await userEvent.click(toggleButton);
      
      const increaseButton = screen.getByLabelText('Increase font size');
      await userEvent.click(increaseButton);
      
      // Should announce the change to screen readers
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('shows active state for enabled features', () => {
      mockAccessibilityContext.contrast = 'high';
      mockAccessibilityContext.reducedMotion = true;
      mockAccessibilityContext.screenReader = true;
      
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      const contrastButton = screen.getByLabelText('Toggle high contrast');
      const motionButton = screen.getByLabelText('Toggle reduced motion');
      const screenReaderButton = screen.getByLabelText('Toggle screen reader mode');
      
      expect(contrastButton).toHaveClass('bg-primary-600');
      expect(motionButton).toHaveClass('bg-primary-600');
      expect(screenReaderButton).toHaveClass('bg-primary-600');
    });

    it('shows disabled state for font size buttons at limits', () => {
      mockAccessibilityContext.fontSize = 'extra-large';
      
      render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      const increaseButton = screen.getByLabelText('Increase font size');
      expect(increaseButton).toBeDisabled();
    });
  });

  describe('Persistence', () => {
    it('maintains toolbar state across re-renders', () => {
      const { rerender } = render(<AccessibilityToolbar />);
      
      const toggleButton = screen.getByLabelText('Accessibility options');
      fireEvent.click(toggleButton);
      
      expect(screen.getByLabelText('Increase font size')).toBeVisible();
      
      rerender(<AccessibilityToolbar />);
      
      expect(screen.getByLabelText('Increase font size')).toBeVisible();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(<AccessibilityToolbar className="custom-toolbar" />);
      
      expect(container.firstChild).toHaveClass('custom-toolbar');
    });

    it('accepts custom position prop', () => {
      render(<AccessibilityToolbar position="bottom-left" />);
      
      const toolbar = screen.getByLabelText('Accessibility options').parentElement;
      expect(toolbar).toHaveClass('bottom-4', 'left-4');
    });
  });
});