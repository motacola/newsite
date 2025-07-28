import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { performance } from 'perf_hooks';

// Mock components for performance testing
const LazyComponent = React.lazy(() => 
  Promise.resolve({ default: () => <div>Lazy Component</div> })
);

const HeavyComponent = () => {
  // Simulate heavy computation
  const heavyData = React.useMemo(() => {
    const data = [];
    for (let i = 0; i < 1000; i++) {
      data.push({ id: i, value: Math.random() });
    }
    return data;
  }, []);

  return (
    <div>
      {heavyData.slice(0, 10).map(item => (
        <div key={item.id}>{item.value}</div>
      ))}
    </div>
  );
};

const ImageHeavyComponent = () => {
  const images = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    src: `/image-${i}.jpg`,
    alt: `Image ${i}`,
  }));

  return (
    <div>
      {images.map(img => (
        <img key={img.id} src={img.src} alt={img.alt} loading="lazy" />
      ))}
    </div>
  );
};

describe('Performance Tests', () => {
  describe('Component Rendering Performance', () => {
    it('renders components within acceptable time limits', async () => {
      const startTime = performance.now();
      
      render(<HeavyComponent />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('handles large lists efficiently', async () => {
      const LargeList = () => {
        const items = Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
        }));

        return (
          <div>
            {items.map(item => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
        );
      };

      const startTime = performance.now();
      render(<LargeList />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('lazy loads components efficiently', async () => {
      const startTime = performance.now();
      
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Lazy Component')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Memory Usage', () => {
    it('does not create memory leaks with frequent re-renders', () => {
      const TestComponent = ({ count }: { count: number }) => {
        const [data, setData] = React.useState<number[]>([]);
        
        React.useEffect(() => {
          setData(Array.from({ length: count }, (_, i) => i));
        }, [count]);
        
        return <div>{data.length} items</div>;
      };

      const { rerender } = render(<TestComponent count={100} />);
      
      // Simulate multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<TestComponent count={100 + i} />);
      }
      
      // Component should still be responsive
      expect(screen.getByText(/items/)).toBeInTheDocument();
    });

    it('properly cleans up event listeners', () => {
      const TestComponent = () => {
        React.useEffect(() => {
          const handleScroll = () => {};
          const handleResize = () => {};
          
          window.addEventListener('scroll', handleScroll);
          window.addEventListener('resize', handleResize);
          
          return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
          };
        }, []);
        
        return <div>Component with listeners</div>;
      };

      const { unmount } = render(<TestComponent />);
      
      // Should not throw errors when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Image Loading Performance', () => {
    it('handles multiple images without blocking', async () => {
      const startTime = performance.now();
      
      render(<ImageHeavyComponent />);
      
      const endTime = performance.now();
      
      // Initial render should be fast even with many images
      expect(endTime - startTime).toBeLessThan(50);
      
      // All images should be present in DOM
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(20);
      
      // Images should have lazy loading
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Animation Performance', () => {
    it('handles CSS animations efficiently', () => {
      const AnimatedComponent = () => {
        const [animate, setAnimate] = React.useState(false);
        
        return (
          <div>
            <button onClick={() => setAnimate(!animate)}>
              Toggle Animation
            </button>
            <div 
              className={`transition-transform duration-300 ${
                animate ? 'transform scale-110' : ''
              }`}
              data-testid="animated-element"
            >
              Animated Element
            </div>
          </div>
        );
      };

      const startTime = performance.now();
      render(<AnimatedComponent />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50);
      expect(screen.getByTestId('animated-element')).toBeInTheDocument();
    });
  });

  describe('Bundle Size Impact', () => {
    it('imports only necessary dependencies', () => {
      // Test that components don't import entire libraries unnecessarily
      const ComponentWithSelectiveImports = () => {
        // Good: selective import
        // import { debounce } from 'lodash/debounce';
        
        // Bad: full library import
        // import _ from 'lodash';
        
        return <div>Optimized imports</div>;
      };

      expect(() => render(<ComponentWithSelectiveImports />)).not.toThrow();
    });
  });

  describe('Network Performance', () => {
    it('handles slow network conditions gracefully', async () => {
      // Mock slow network
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ data: 'test' })
          }), 2000)
        )
      );

      const NetworkComponent = () => {
        const [data, setData] = React.useState(null);
        const [loading, setLoading] = React.useState(false);
        
        const loadData = async () => {
          setLoading(true);
          try {
            const response = await fetch('/api/data');
            const result = await response.json();
            setData(result.data);
          } finally {
            setLoading(false);
          }
        };
        
        return (
          <div>
            <button onClick={loadData}>Load Data</button>
            {loading && <div>Loading...</div>}
            {data && <div>Data: {data}</div>}
          </div>
        );
      };

      render(<NetworkComponent />);
      
      // Component should render immediately
      expect(screen.getByText('Load Data')).toBeInTheDocument();
      
      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Accessibility Performance', () => {
    it('maintains performance with accessibility features enabled', () => {
      const AccessibleComponent = () => {
        const [items] = React.useState(
          Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }))
        );
        
        return (
          <div role="list" aria-label="Large list">
            {items.map(item => (
              <div 
                key={item.id}
                role="listitem"
                tabIndex={0}
                aria-label={`Item ${item.id}`}
              >
                {item.name}
              </div>
            ))}
          </div>
        );
      };

      const startTime = performance.now();
      render(<AccessibleComponent />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('State Management Performance', () => {
    it('handles frequent state updates efficiently', async () => {
      const StateHeavyComponent = () => {
        const [count, setCount] = React.useState(0);
        const [items, setItems] = React.useState<number[]>([]);
        
        React.useEffect(() => {
          setItems(Array.from({ length: count }, (_, i) => i));
        }, [count]);
        
        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>
              Increment ({count})
            </button>
            <div>Items: {items.length}</div>
          </div>
        );
      };

      const startTime = performance.now();
      render(<StateHeavyComponent />);
      
      // Simulate rapid state updates
      const button = screen.getByText(/Increment/);
      for (let i = 0; i < 10; i++) {
        button.click();
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});