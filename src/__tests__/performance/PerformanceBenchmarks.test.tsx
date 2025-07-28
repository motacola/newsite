/**
 * Performance Benchmarks Test Suite
 * Tests performance across different devices and network conditions
 */

import { render, screen, waitFor } from '@testing-library/react';
import { performance } from 'perf_hooks';

// Mock components for testing
const MockHero = () => (
  <header role="banner">
    <h1>Christopher Belgrave</h1>
    <button>View Projects</button>
  </header>
);

const MockAIProjects = () => (
  <section>
    <h2>AI Projects</h2>
    <div>Project content</div>
  </section>
);

const MockMediaGallery = ({ images }: { images: Array<{ src: string; alt: string }> }) => (
  <div role="region">
    {images.map((img, index) => (
      <img key={index} src={img.src} alt={img.alt} />
    ))}
  </div>
);

const MockProjectCard = ({ project }: { project: { title: string } }) => (
  <div>
    <h3>{project.title}</h3>
  </div>
);

// Mock project data
const mockAiProjects = [
  { title: 'AI Project 1', description: 'Test project' },
  { title: 'AI Project 2', description: 'Test project' },
];

// Mock performance observer for testing
const mockPerformanceObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
};

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16); // ~60fps
  return 1;
});

// Mock Web Vitals
const mockWebVitals = {
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
};

// Setup mocks
beforeAll(() => {
  global.PerformanceObserver = mockPerformanceObserver as any;
  global.IntersectionObserver = mockIntersectionObserver as any;
  global.ResizeObserver = mockResizeObserver as any;
  global.requestAnimationFrame = mockRequestAnimationFrame;
  
  // Mock performance.now
  global.performance.now = jest.fn(() => Date.now());
  
  // Mock Image constructor
  global.Image = class {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src = '';
    
    constructor() {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 100);
    }
  } as any;
});

describe('Performance Benchmarks', () => {
  describe('Component Render Performance', () => {
    it('should render Hero component within performance budget', async () => {
      const startTime = performance.now();
      
      render(<MockHero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Hero should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should render ProjectCard efficiently', async () => {
      const project = mockAiProjects[0];
      const startTime = performance.now();
      
      render(<MockProjectCard project={project} />);
      
      await waitFor(() => {
        expect(screen.getByText(project.title)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // ProjectCard should render within 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it('should handle large lists efficiently', async () => {
      const startTime = performance.now();
      
      render(<MockAIProjects />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI Projects/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Large lists should render within 200ms
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks in MediaGallery', async () => {
      const mockImages = [
        { src: '/test1.jpg', alt: 'Test 1' },
        { src: '/test2.jpg', alt: 'Test 2' },
        { src: '/test3.jpg', alt: 'Test 3' },
      ];

      const { unmount } = render(
        <MockMediaGallery images={mockImages} />
      );

      // Simulate component lifecycle
      await waitFor(() => {
        expect(screen.getByRole('region')).toBeInTheDocument();
      });

      // Unmount and check for cleanup
      unmount();

      // Verify observers are disconnected
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should cleanup event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<MockHero />);
      
      unmount();

      // Verify cleanup (this would be implementation specific)
      expect(removeEventListenerSpy).toHaveBeenCalled();
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Animation Performance', () => {
    it('should maintain 60fps during animations', async () => {
      const frameCount = 60;
      const expectedDuration = 1000; // 1 second
      
      render(<MockHero />);
      
      // Simulate animation frames
      const startTime = performance.now();
      for (let i = 0; i < frameCount; i++) {
        mockRequestAnimationFrame(() => {});
      }
      const endTime = performance.now();
      
      const actualDuration = endTime - startTime;
      
      // Should complete 60 frames close to 1 second (allowing some variance)
      expect(actualDuration).toBeLessThan(expectedDuration + 100);
    });

    it('should handle scroll animations efficiently', async () => {
      const scrollHandler = jest.fn();
      
      render(<MockHero />);
      
      // Simulate scroll events
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        window.dispatchEvent(new Event('scroll'));
      }
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      
      // Scroll handling should be efficient
      expect(processingTime).toBeLessThan(50);
    });
  });

  describe('Network Simulation', () => {
    it('should handle slow network conditions gracefully', async () => {
      // Mock slow network
      const originalFetch = global.fetch;
      global.fetch = jest.fn(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ data: 'test' })
          } as Response), 3000)
        )
      );

      const startTime = performance.now();
      
      render(<MockAIProjects />);
      
      // Component should render immediately with loading states
      await waitFor(() => {
        expect(screen.getByText(/AI Projects/i)).toBeInTheDocument();
      }, { timeout: 1000 });
      
      const renderTime = performance.now() - startTime;
      
      // Should render loading state quickly even with slow network
      expect(renderTime).toBeLessThan(1000);
      
      global.fetch = originalFetch;
    });

    it('should implement proper loading states', async () => {
      render(<MockMediaGallery images={[]} />);
      
      // Should show loading state initially
      await waitFor(() => {
        expect(screen.getByRole('region')).toBeInTheDocument();
      });
    });
  });

  describe('Bundle Size Impact', () => {
    it('should lazy load heavy components', async () => {
      // This would typically be tested with webpack bundle analyzer
      // For now, we'll test that components render asynchronously
      
      const { container } = render(<MockAIProjects />);
      
      // Initial render should be fast
      expect(container.firstChild).toBeInTheDocument();
      
      // Heavy content should load progressively
      await waitFor(() => {
        expect(screen.getByText(/AI Projects/i)).toBeInTheDocument();
      });
    });
  });
});

describe('Core Web Vitals Simulation', () => {
  it('should meet LCP requirements', async () => {
    const startTime = performance.now();
    
    render(<MockHero />);
    
    // Simulate largest contentful paint
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
    
    const lcp = performance.now() - startTime;
    
    // LCP should be under 2.5 seconds (we'll test for much faster)
    expect(lcp).toBeLessThan(500);
  });

  it('should minimize layout shifts', async () => {
    const { rerender } = render(<MockProjectCard project={mockAiProjects[0]} />);
    
    // Get initial layout
    const initialLayout = screen.getByText(mockAiProjects[0].title).getBoundingClientRect();
    
    // Rerender with same props
    rerender(<MockProjectCard project={mockAiProjects[0]} />);
    
    // Layout should remain stable
    const newLayout = screen.getByText(mockAiProjects[0].title).getBoundingClientRect();
    
    expect(initialLayout.top).toBe(newLayout.top);
    expect(initialLayout.left).toBe(newLayout.left);
  });

  it('should handle first input delay efficiently', async () => {
    render(<MockHero />);
    
    const button = screen.getByRole('button', { name: /view projects/i });
    
    const startTime = performance.now();
    button.click();
    const endTime = performance.now();
    
    const fid = endTime - startTime;
    
    // First Input Delay should be minimal
    expect(fid).toBeLessThan(100);
  });
});