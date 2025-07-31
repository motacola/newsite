import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Navigation } from '../Navigation';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock scroll spy hook
jest.mock('../../lib/hooks/useScrollSpy', () => ({
  useScrollSpy: () => ({
    activeSection: 'home',
    sections: ['home', 'about', 'projects', 'experience', 'contact'],
  }),
}));

describe('Navigation', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
    
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Navigation', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('renders desktop navigation correctly', () => {
      render(<Navigation />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Christopher Belgrave')).toBeInTheDocument();
      
      // Check navigation links
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Experience')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('highlights active section', () => {
      render(<Navigation />);
      
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('text-primary-600');
    });

    it('handles navigation link clicks', async () => {
      render(<Navigation />);
      
      const aboutLink = screen.getByText('About');
      await userEvent.click(aboutLink);
      
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('shows scroll-based styling changes', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      
      // Simulate scroll
      fireEvent.scroll(window, { target: { scrollY: 100 } });
      
      expect(nav).toHaveClass('bg-white/95', 'backdrop-blur-sm');
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('renders mobile navigation correctly', () => {
      render(<Navigation />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
      expect(screen.getByText('Christopher Belgrave')).toBeInTheDocument();
    });

    it('toggles mobile menu on hamburger click', async () => {
      render(<Navigation />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      
      // Menu should be closed initially
      expect(screen.queryByText('Home')).not.toBeVisible();
      
      // Open menu
      await userEvent.click(menuButton);
      expect(screen.getByText('Home')).toBeVisible();
      
      // Close menu
      await userEvent.click(menuButton);
      expect(screen.queryByText('Home')).not.toBeVisible();
    });

    it('closes mobile menu when link is clicked', async () => {
      render(<Navigation />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      await userEvent.click(menuButton);
      
      const aboutLink = screen.getByText('About');
      await userEvent.click(aboutLink);
      
      expect(screen.queryByText('Home')).not.toBeVisible();
    });

    it('closes mobile menu on escape key', async () => {
      render(<Navigation />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      await userEvent.click(menuButton);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(screen.queryByText('Home')).not.toBeVisible();
    });

    it('closes mobile menu when clicking outside', async () => {
      render(<Navigation />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      await userEvent.click(menuButton);
      
      // Click outside the menu
      fireEvent.mouseDown(document.body);
      
      expect(screen.queryByText('Home')).not.toBeVisible();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation through menu items', async () => {
      render(<Navigation />);
      
      const homeLink = screen.getByText('Home');
      const aboutLink = screen.getByText('About');
      const projectsLink = screen.getByText('Projects');
      
      homeLink.focus();
      expect(homeLink).toHaveFocus();
      
      fireEvent.keyDown(homeLink, { key: 'Tab' });
      expect(aboutLink).toHaveFocus();
      
      fireEvent.keyDown(aboutLink, { key: 'Tab' });
      expect(projectsLink).toHaveFocus();
    });

    it('handles Enter and Space key activation', async () => {
      render(<Navigation />);
      
      const aboutLink = screen.getByText('About');
      aboutLink.focus();
      
      fireEvent.keyDown(aboutLink, { key: 'Enter' });
      expect(window.scrollTo).toHaveBeenCalled();
      
      fireEvent.keyDown(aboutLink, { key: ' ' });
      expect(window.scrollTo).toHaveBeenCalledTimes(2);
    });

    it('traps focus in mobile menu when open', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Navigation />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      await userEvent.click(menuButton);
      
      const firstLink = screen.getByText('Home');
      const lastLink = screen.getByText('Contact');
      
      // Tab from last item should go to first
      lastLink.focus();
      fireEvent.keyDown(lastLink, { key: 'Tab' });
      expect(firstLink).toHaveFocus();
      
      // Shift+Tab from first item should go to last
      firstLink.focus();
      fireEvent.keyDown(firstLink, { key: 'Tab', shiftKey: true });
      expect(lastLink).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Navigation />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-controls');
    });

    it('updates ARIA attributes when mobile menu is toggled', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Navigation />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      
      await userEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      
      await userEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('has proper heading hierarchy', () => {
      render(<Navigation />);
      
      // Logo should be a heading or have proper role
      const logo = screen.getByText('Christopher Belgrave');
      expect(logo.tagName).toBe('H1');
    });

    it('provides skip link for keyboard users', () => {
      render(<Navigation />);
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to viewport changes', () => {
      const { rerender } = render(<Navigation />);
      
      // Desktop view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      fireEvent.resize(window);
      rerender(<Navigation />);
      
      expect(screen.queryByLabelText('Toggle menu')).not.toBeInTheDocument();
      
      // Mobile view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      fireEvent.resize(window);
      rerender(<Navigation />);
      
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
    });
  });

  describe('Scroll Behavior', () => {
    it('updates active section based on scroll position', () => {
      render(<Navigation />);
      
      // Mock scroll spy returning different active section
      jest.mocked(require('../../lib/hooks/useScrollSpy').useScrollSpy).mockReturnValue({
        activeSection: 'projects',
        sections: ['home', 'about', 'projects', 'experience', 'contact'],
      });
      
      const { rerender } = render(<Navigation />);
      rerender(<Navigation />);
      
      const projectsLink = screen.getByText('Projects').closest('a');
      expect(projectsLink).toHaveClass('text-primary-600');
    });

    it('shows/hides navigation based on scroll direction', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      
      // Scroll down
      fireEvent.scroll(window, { target: { scrollY: 200 } });
      expect(nav).toHaveClass('-translate-y-full');
      
      // Scroll up
      fireEvent.scroll(window, { target: { scrollY: 100 } });
      expect(nav).toHaveClass('translate-y-0');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<Navigation className="custom-nav" />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-nav');
    });

    it('accepts custom navigation items', () => {
      const customItems = [
        { label: 'Custom 1', href: '#custom1' },
        { label: 'Custom 2', href: '#custom2' },
      ];
      
      render(<Navigation items={customItems} />);
      
      expect(screen.getByText('Custom 1')).toBeInTheDocument();
      expect(screen.getByText('Custom 2')).toBeInTheDocument();
    });
  });
});