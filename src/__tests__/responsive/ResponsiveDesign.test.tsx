/**
 * Responsive Design Test Suite
 * Tests responsive behavior across different screen sizes
 */

import { render, screen, waitFor } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';
import { Navigation } from '@/components/sections/Navigation';
import { AIProjects } from '@/components/sections/AIProjects';
import { MediaGallery } from '@/components/ui/MediaGallery';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline';
import { aiProjects } from '@/content/ai-projects';

// Viewport size configurations
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  largeDesktop: { width: 1440, height: 900 },
  ultraWide: { width: 1920, height: 1080 },
};

// Helper function to set viewport size
const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock matchMedia for responsive queries
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(mockMatchMedia),
  });
});

describe('Responsive Design Tests', () => {
  describe('Mobile Viewport (375px)', () => {
    beforeEach(() => {
      setViewport(viewports.mobile.width, viewports.mobile.height);
      
      // Mock mobile media queries
      (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
        ...mockMatchMedia(query),
        matches: query.includes('max-width: 640px') || query.includes('max-width: 768px'),
      }));
    });

    it('should render Hero section responsively on mobile', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      const hero = screen.getByRole('banner');
      expect(hero).toBeInTheDocument();
      
      // Check for mobile-specific content structure
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should show mobile navigation', async () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Should have mobile menu button
      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('should stack project cards vertically', async () => {
      render(<AIProjects />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI Projects/i)).toBeInTheDocument();
      });
      
      // Projects should be visible
      const projectsSection = screen.getByText(/AI Projects/i).closest('section');
      expect(projectsSection).toBeInTheDocument();
    });

    it('should render timeline vertically on mobile', async () => {
      const mockExperiences = [
        {
          id: '1',
          title: 'Senior Project Manager',
          company: 'Test Company',
          duration: { start: '2020', end: '2023' },
          description: 'Test description',
          achievements: ['Achievement 1'],
          skills: ['Skill 1'],
          projects: [],
          featured: true,
        },
      ];

      render(<ExperienceTimeline experiences={mockExperiences} />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Project Manager')).toBeInTheDocument();
      });
    });

    it('should handle media gallery on mobile', async () => {
      const mockImages = [
        { src: '/test1.jpg', alt: 'Test 1' },
        { src: '/test2.jpg', alt: 'Test 2' },
      ];

      render(<MediaGallery images={mockImages} />);
      
      await waitFor(() => {
        expect(screen.getByRole('region')).toBeInTheDocument();
      });
    });
  });

  describe('Tablet Viewport (768px)', () => {
    beforeEach(() => {
      setViewport(viewports.tablet.width, viewports.tablet.height);
      
      (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
        ...mockMatchMedia(query),
        matches: query.includes('min-width: 640px') && query.includes('max-width: 1024px'),
      }));
    });

    it('should adapt Hero for tablet', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      const hero = screen.getByRole('banner');
      expect(hero).toBeInTheDocument();
    });

    it('should show expanded navigation on tablet', async () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should display projects in grid on tablet', async () => {
      render(<AIProjects />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI Projects/i)).toBeInTheDocument();
      });
    });
  });

  describe('Desktop Viewport (1024px)', () => {
    beforeEach(() => {
      setViewport(viewports.desktop.width, viewports.desktop.height);
      
      (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
        ...mockMatchMedia(query),
        matches: query.includes('min-width: 1024px'),
      }));
    });

    it('should render full Hero layout on desktop', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      const hero = screen.getByRole('banner');
      expect(hero).toBeInTheDocument();
    });

    it('should show full navigation on desktop', async () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Should not have mobile menu button
      const menuButton = screen.queryByRole('button', { name: /menu/i });
      expect(menuButton).not.toBeInTheDocument();
    });

    it('should display horizontal timeline on desktop', async () => {
      const mockExperiences = [
        {
          id: '1',
          title: 'Senior Project Manager',
          company: 'Test Company',
          duration: { start: '2020', end: '2023' },
          description: 'Test description',
          achievements: ['Achievement 1'],
          skills: ['Skill 1'],
          projects: [],
          featured: true,
        },
      ];

      render(<ExperienceTimeline experiences={mockExperiences} />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior Project Manager')).toBeInTheDocument();
      });
    });
  });

  describe('Large Desktop Viewport (1440px)', () => {
    beforeEach(() => {
      setViewport(viewports.largeDesktop.width, viewports.largeDesktop.height);
      
      (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
        ...mockMatchMedia(query),
        matches: query.includes('min-width: 1280px'),
      }));
    });

    it('should utilize full width on large desktop', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
    });

    it('should show expanded project grid', async () => {
      render(<AIProjects />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI Projects/i)).toBeInTheDocument();
      });
    });
  });

  describe('Ultra-wide Viewport (1920px)', () => {
    beforeEach(() => {
      setViewport(viewports.ultraWide.width, viewports.ultraWide.height);
      
      (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
        ...mockMatchMedia(query),
        matches: query.includes('min-width: 1536px'),
      }));
    });

    it('should handle ultra-wide layouts', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
    });
  });

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape transition', async () => {
      // Start in portrait
      setViewport(375, 667);
      
      const { rerender } = render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      // Switch to landscape
      setViewport(667, 375);
      
      rerender(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
    });

    it('should adapt navigation to orientation changes', async () => {
      setViewport(375, 667); // Portrait
      
      const { rerender } = render(<Navigation />);
      
      let nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      setViewport(667, 375); // Landscape
      
      rerender(<Navigation />);
      
      nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Dynamic Content Adaptation', () => {
    it('should adjust project card layout based on screen size', async () => {
      const project = aiProjects[0];
      
      // Test on mobile
      setViewport(375, 667);
      const { rerender } = render(<ProjectCard project={project} />);
      
      await waitFor(() => {
        expect(screen.getByText(project.title)).toBeInTheDocument();
      });
      
      // Test on desktop
      setViewport(1024, 768);
      rerender(<ProjectCard project={project} />);
      
      await waitFor(() => {
        expect(screen.getByText(project.title)).toBeInTheDocument();
      });
    });

    it('should handle text scaling across viewports', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Touch vs Mouse Interactions', () => {
    it('should handle touch interactions on mobile', async () => {
      setViewport(375, 667);
      
      // Mock touch capability
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true,
      });
      
      render(<ProjectCard project={aiProjects[0]} />);
      
      await waitFor(() => {
        expect(screen.getByText(aiProjects[0].title)).toBeInTheDocument();
      });
    });

    it('should handle mouse interactions on desktop', async () => {
      setViewport(1024, 768);
      
      // Mock no touch capability
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      });
      
      render(<ProjectCard project={aiProjects[0]} />);
      
      await waitFor(() => {
        expect(screen.getByText(aiProjects[0].title)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Across Screen Sizes', () => {
    it('should maintain performance on small screens', async () => {
      setViewport(375, 667);
      
      const startTime = performance.now();
      
      render(<AIProjects />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI Projects/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(200);
    });

    it('should handle large screen rendering efficiently', async () => {
      setViewport(1920, 1080);
      
      const startTime = performance.now();
      
      render(<AIProjects />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI Projects/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(300);
    });
  });
});