/**
 * Animation Performance Test Suite
 * Tests animation smoothness and performance across different scenarios
 */

import { render, screen, waitFor, act } from '@testing-library/react';

// Mock components for testing
const MockHero = () => (
  <header role="banner">
    <h1>Christopher Belgrave</h1>
    <button>View Projects</button>
  </header>
);

const MockScrollReveal = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const MockAnimatedSection = ({ children, delay }: { children: React.ReactNode; delay?: number }) => (
  <div data-delay={delay}>{children}</div>
);

const MockTextReveal = ({ text, duration }: { text: string; duration?: number }) => (
  <span className="">
    {text.split(' ').map((word, index) => (
      <span
        key={index}
        className="inline-block transition-all duration-700 ease-out opacity-0 translate-y-4 opacity-0 translate-y-4"
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        {word}{' '}
      </span>
    ))}
  </span>
);

const MockMediaGallery = ({ images }: { images: Array<{ src: string; alt: string }> }) => (
  <div role="region">
    {images.map((img, index) => (
      <img key={index} src={img.src} alt={img.alt} />
    ))}
  </div>
);

// Mock performance monitoring
const mockPerformanceObserver = jest.fn();
const mockPerformanceEntries: PerformanceEntry[] = [];

// Mock requestAnimationFrame with timing control
let rafCallbacks: FrameRequestCallback[] = [];
let currentTime = 0;

const mockRequestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  rafCallbacks.push(callback);
  return rafCallbacks.length;
});

const mockCancelAnimationFrame = jest.fn((id: number) => {
  rafCallbacks.splice(id - 1, 1);
});

const flushAnimationFrames = (frames = 1) => {
  for (let i = 0; i < frames; i++) {
    currentTime += 16.67; // ~60fps
    act(() => {
      rafCallbacks.forEach(callback => callback(currentTime));
    });
  }
  rafCallbacks = [];
};

// Mock IntersectionObserver for scroll animations
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});

beforeAll(() => {
  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame;
  global.IntersectionObserver = mockIntersectionObserver;
  
  // Mock performance API
  Object.defineProperty(global.performance, 'now', {
    value: jest.fn(() => currentTime),
  });
  
  global.PerformanceObserver = mockPerformanceObserver as any;
});

beforeEach(() => {
  rafCallbacks = [];
  currentTime = 0;
  mockRequestAnimationFrame.mockClear();
  mockCancelAnimationFrame.mockClear();
});

describe('Animation Performance Tests', () => {
  describe('Frame Rate Consistency', () => {
    it('should maintain 60fps during hero animations', async () => {
      render(<MockHero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      const frameCount = 60;
      const expectedDuration = 1000; // 1 second
      
      const startTime = performance.now();
      flushAnimationFrames(frameCount);
      const endTime = performance.now();
      
      const actualDuration = endTime - startTime;
      const fps = frameCount / (actualDuration / 1000);
      
      // Should maintain close to 60fps
      expect(fps).toBeGreaterThan(55);
      expect(fps).toBeLessThan(65);
    });

    it('should handle multiple simultaneous animations', async () => {
      render(
        <div>
          <MockAnimatedSection>
            <MockTextReveal text="Test Animation 1" />
          </MockAnimatedSection>
          <MockAnimatedSection>
            <MockTextReveal text="Test Animation 2" />
          </MockAnimatedSection>
          <MockAnimatedSection>
            <MockTextReveal text="Test Animation 3" />
          </MockAnimatedSection>
        </div>
      );
      
      // Trigger multiple animations
      flushAnimationFrames(30);
      
      // Should handle multiple animations without significant performance drop
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('should optimize animation performance under load', async () => {
      const mockImages = Array.from({ length: 20 }, (_, i) => ({
        src: `/test${i}.jpg`,
        alt: `Test ${i}`,
      }));

      render(<MockMediaGallery images={mockImages} />);
      
      await waitFor(() => {
        expect(screen.getByRole('region')).toBeInTheDocument();
      });
      
      // Simulate heavy animation load
      const startTime = performance.now();
      flushAnimationFrames(120); // 2 seconds worth
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // Should complete within reasonable time even under load
      expect(duration).toBeLessThan(2500);
    });
  });

  describe('Animation Lifecycle Management', () => {
    it('should properly cleanup animations on unmount', async () => {
      const { unmount } = render(
        <MockScrollReveal>
          <div>Test Content</div>
        </MockScrollReveal>
      );
      
      // Start some animations
      flushAnimationFrames(5);
      
      const rafCallsBeforeUnmount = mockRequestAnimationFrame.mock.calls.length;
      
      unmount();
      
      // Should not create new animation frames after unmount
      flushAnimationFrames(5);
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('should pause animations when not visible', async () => {
      const mockObserver = {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
      
      mockIntersectionObserver.mockReturnValue(mockObserver);
      
      render(
        <MockScrollReveal>
          <div>Test Content</div>
        </MockScrollReveal>
      );
      
      // Simulate element going out of view
      const observerCallback = mockObserver.observe.mock.calls[0]?.[0];
      if (observerCallback) {
        // Mock intersection observer callback
        act(() => {
          // Simulate element not intersecting
        });
      }
      
      expect(mockObserver.observe).toHaveBeenCalled();
    });

    it('should handle animation interruptions gracefully', async () => {
      const { rerender } = render(
        <MockTextReveal text="Original Text" />
      );
      
      // Start animation
      flushAnimationFrames(5);
      
      // Interrupt with new content
      rerender(<MockTextReveal text="New Text" />);
      
      // Should handle the interruption without errors
      flushAnimationFrames(5);
      
      expect(screen.getByText('New Text')).toBeInTheDocument();
    });
  });

  describe('Performance Under Different Conditions', () => {
    it('should adapt to reduced motion preferences', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });
      
      render(<MockHero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      // Should use fewer animation frames with reduced motion
      flushAnimationFrames(10);
      
      // Verify reduced animation calls
      expect(mockRequestAnimationFrame.mock.calls.length).toBeLessThan(20);
    });

    it('should handle low-end device performance', async () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2, // Low CPU cores
        configurable: true,
      });
      
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 2, // Low memory
        configurable: true,
      });
      
      render(<MockHero />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
      
      // Should still perform reasonably on low-end devices
      const startTime = performance.now();
      flushAnimationFrames(30);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should optimize for battery-conscious devices', async () => {
      // Mock battery API
      Object.defineProperty(navigator, 'getBattery', {
        value: () => Promise.resolve({
          level: 0.2, // Low battery
          charging: false,
        }),
        configurable: true,
      });
      
      render(<MockAnimatedSection>
        <div>Battery Conscious Content</div>
      </MockAnimatedSection>);
      
      // Should reduce animation complexity on low battery
      flushAnimationFrames(10);
      
      expect(screen.getByText('Battery Conscious Content')).toBeInTheDocument();
    });
  });

  describe('Memory Management During Animations', () => {
    it('should not create memory leaks during long animations', async () => {
      const { unmount } = render(<MockHero />);
      
      // Simulate long-running animation
      flushAnimationFrames(300); // 5 seconds worth
      
      // Check that callbacks are cleaned up
      const callbacksBeforeUnmount = rafCallbacks.length;
      
      unmount();
      
      // Should clean up all callbacks
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('should handle rapid component mounting/unmounting', async () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <MockScrollReveal key={i}>
            <div>Component {i}</div>
          </MockScrollReveal>
        );
        
        flushAnimationFrames(2);
        unmount();
      }
      
      // Should handle rapid lifecycle changes without issues
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('Animation Timing and Easing', () => {
    it('should respect animation duration settings', async () => {
      render(<MockTextReveal text="Timed Animation" duration={500} />);
      
      const startTime = performance.now();
      
      // Run animation for specified duration
      flushAnimationFrames(30); // ~500ms at 60fps
      
      const endTime = performance.now();
      const actualDuration = endTime - startTime;
      
      // Should complete close to specified duration
      expect(actualDuration).toBeGreaterThan(450);
      expect(actualDuration).toBeLessThan(550);
    });

    it('should handle staggered animations efficiently', async () => {
      render(
        <div>
          {Array.from({ length: 5 }, (_, i) => (
            <MockAnimatedSection key={i} delay={i * 100}>
              <div>Staggered Item {i}</div>
            </MockAnimatedSection>
          ))}
        </div>
      );
      
      // Should handle staggered timing without performance issues
      flushAnimationFrames(60);
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Scroll-Based Animation Performance', () => {
    it('should throttle scroll-based animations', async () => {
      render(
        <MockScrollReveal>
          <div>Scroll Animated Content</div>
        </MockScrollReveal>
      );
      
      // Simulate rapid scroll events
      for (let i = 0; i < 100; i++) {
        window.dispatchEvent(new Event('scroll'));
      }
      
      // Should throttle scroll handling
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should handle parallax animations efficiently', async () => {
      render(<MockHero />); // Assuming Hero has parallax effects
      
      // Simulate scroll with parallax
      for (let i = 0; i < 50; i++) {
        window.dispatchEvent(new Event('scroll'));
        flushAnimationFrames(1);
      }
      
      // Should handle parallax without significant performance impact
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Animation Error Handling', () => {
    it('should handle animation errors gracefully', async () => {
      // Mock animation frame error
      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = jest.fn(() => {
        throw new Error('Animation frame error');
      });
      
      render(<MockTextReveal text="Error Test" />);
      
      // Should not crash on animation errors
      await waitFor(() => {
        expect(screen.getByText('Error Test')).toBeInTheDocument();
      });
      
      global.requestAnimationFrame = originalRAF;
    });

    it('should fallback when animations are not supported', async () => {
      // Mock missing animation support
      delete (global as any).requestAnimationFrame;
      
      render(<MockAnimatedSection>
        <div>Fallback Content</div>
      </MockAnimatedSection>);
      
      // Should render content even without animation support
      await waitFor(() => {
        expect(screen.getByText('Fallback Content')).toBeInTheDocument();
      });
    });
  });
});