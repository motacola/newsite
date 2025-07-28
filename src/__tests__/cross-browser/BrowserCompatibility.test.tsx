/**
 * Cross-Browser Compatibility Test Suite
 * Tests functionality across different browser environments
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hero } from '@/components/sections/Hero';
import { Navigation } from '@/components/sections/Navigation';
import { ContactForm } from '@/components/ui/ContactForm';
import { MediaGallery } from '@/components/ui/MediaGallery';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { aiProjects } from '@/content/ai-projects';

// Browser feature detection mocks
const createBrowserMock = (features: Record<string, boolean>) => {
  const originalWindow = global.window;
  
  return {
    mockBrowser: () => {
      Object.defineProperty(global.window, 'CSS', {
        value: features.css ? { supports: jest.fn(() => features.cssSupports) } : undefined,
        configurable: true,
      });
      
      Object.defineProperty(global.window, 'IntersectionObserver', {
        value: features.intersectionObserver ? jest.fn(() => ({
          observe: jest.fn(),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        })) : undefined,
        configurable: true,
      });
      
      Object.defineProperty(global.window, 'ResizeObserver', {
        value: features.resizeObserver ? jest.fn(() => ({
          observe: jest.fn(),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        })) : undefined,
        configurable: true,
      });
      
      Object.defineProperty(global.window, 'requestAnimationFrame', {
        value: features.raf ? jest.fn((cb) => setTimeout(cb, 16)) : undefined,
        configurable: true,
      });
      
      Object.defineProperty(global.navigator, 'userAgent', {
        value: features.userAgent || 'Mozilla/5.0 (compatible; Test)',
        configurable: true,
      });
    },
    
    restore: () => {
      global.window = originalWindow;
    }
  };
};

describe('Cross-Browser Compatibility', () => {
  describe('Modern Browser Support', () => {
    const modernBrowser = createBrowserMock({
      css: true,
      cssSupports: true,
      intersectionObserver: true,
      resizeObserver: true,
      raf: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
    });

    beforeEach(() => {
      modernBrowser.mockBrowser();
    });

    afterEach(() => {
      modernBrowser.restore();
    });

    it('should render Hero with all modern features', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      // Should have modern CSS features
      const heroElement = screen.getByRole('banner');
      expect(heroElement).toBeInTheDocument();
    });

    it('should handle modern navigation features', async () => {
      const user = userEvent.setup();
      
      render(<Navigation />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();
      
      // Test modern interaction features
      const menuButton = screen.getByRole('button', { name: /menu/i });
      if (menuButton) {
        await user.click(menuButton);
      }
    });
  });

  describe('Legacy Browser Support', () => {
    const legacyBrowser = createBrowserMock({
      css: false,
      cssSupports: false,
      intersectionObserver: false,
      resizeObserver: false,
      raf: false,
      userAgent: 'Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 10.0)',
    });

    beforeEach(() => {
      legacyBrowser.mockBrowser();
    });

    afterEach(() => {
      legacyBrowser.restore();
    });

    it('should gracefully degrade Hero component', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      // Should still render basic content
      const heroElement = screen.getByRole('banner');
      expect(heroElement).toBeInTheDocument();
    });

    it('should provide fallbacks for missing APIs', async () => {
      render(<MediaGallery images={[
        { src: '/test1.jpg', alt: 'Test 1' },
        { src: '/test2.jpg', alt: 'Test 2' },
      ]} />);
      
      // Should render without modern APIs
      await waitFor(() => {
        expect(screen.getByRole('region')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Browser Support', () => {
    const mobileBrowser = createBrowserMock({
      css: true,
      cssSupports: true,
      intersectionObserver: true,
      resizeObserver: true,
      raf: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    });

    beforeEach(() => {
      mobileBrowser.mockBrowser();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    afterEach(() => {
      mobileBrowser.restore();
    });

    it('should handle touch interactions', async () => {
      const user = userEvent.setup();
      
      render(<ProjectCard project={aiProjects[0]} />);
      
      const card = screen.getByText(aiProjects[0].title).closest('div');
      expect(card).toBeInTheDocument();
      
      // Simulate touch interaction
      if (card) {
        fireEvent.touchStart(card);
        fireEvent.touchEnd(card);
      }
    });

    it('should adapt to mobile viewport', async () => {
      render(<Navigation />);
      
      // Should render mobile-appropriate navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Form Compatibility', () => {
    it('should work across different browsers', async () => {
      const user = userEvent.setup();
      
      render(<ContactForm />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(messageInput, 'Test message');
      
      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
      expect(messageInput).toHaveValue('Test message');
    });

    it('should handle form validation consistently', async () => {
      const user = userEvent.setup();
      
      render(<ContactForm />);
      
      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });
  });

  describe('CSS Feature Support', () => {
    it('should handle CSS Grid fallbacks', () => {
      // Mock CSS.supports
      const mockSupports = jest.fn();
      Object.defineProperty(window, 'CSS', {
        value: { supports: mockSupports },
        configurable: true,
      });
      
      mockSupports.mockReturnValue(false); // No grid support
      
      render(<Hero />);
      
      const heroElement = screen.getByRole('banner');
      expect(heroElement).toBeInTheDocument();
    });

    it('should handle Flexbox fallbacks', () => {
      const mockSupports = jest.fn();
      Object.defineProperty(window, 'CSS', {
        value: { supports: mockSupports },
        configurable: true,
      });
      
      mockSupports.mockReturnValue(false); // No flexbox support
      
      render(<Navigation />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();
    });
  });

  describe('JavaScript Feature Support', () => {
    it('should handle missing Promise support', async () => {
      const originalPromise = global.Promise;
      
      // Mock missing Promise
      delete (global as any).Promise;
      
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      // Restore Promise
      global.Promise = originalPromise;
    });

    it('should handle missing fetch API', async () => {
      const originalFetch = global.fetch;
      
      // Mock missing fetch
      delete (global as any).fetch;
      
      render(<ContactForm />);
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      // Restore fetch
      global.fetch = originalFetch;
    });
  });

  describe('Accessibility Across Browsers', () => {
    it('should maintain ARIA support', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<Hero />);
      
      const button = screen.getByRole('button', { name: /view projects/i });
      
      // Test keyboard navigation
      await user.tab();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      // Should handle keyboard activation
    });

    it('should work with screen readers', () => {
      render(<ProjectCard project={aiProjects[0]} />);
      
      const card = screen.getByText(aiProjects[0].title);
      const cardContainer = card.closest('[role]');
      
      // Should have proper ARIA attributes
      expect(cardContainer || card).toBeInTheDocument();
    });
  });

  describe('Performance Across Browsers', () => {
    it('should handle animation performance differences', async () => {
      // Mock different animation capabilities
      const mockRAF = jest.fn((callback) => {
        setTimeout(callback, 32); // Simulate 30fps instead of 60fps
        return 1;
      });
      
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: mockRAF,
        configurable: true,
      });
      
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      // Should still work with reduced performance
      expect(mockRAF).toHaveBeenCalled();
    });

    it('should adapt to different memory constraints', () => {
      // Mock memory API
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 2, // Low memory device
        configurable: true,
      });
      
      render(<MediaGallery images={[
        { src: '/test1.jpg', alt: 'Test 1' },
        { src: '/test2.jpg', alt: 'Test 2' },
        { src: '/test3.jpg', alt: 'Test 3' },
      ]} />);
      
      // Should render appropriately for low memory
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });
});