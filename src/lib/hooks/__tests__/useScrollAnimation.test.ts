import { renderHook } from '@testing-library/react';
import { useScrollAnimation, useStaggeredAnimation } from '../useScrollAnimation';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('useScrollAnimation', () => {
  beforeEach(() => {
    mockIntersectionObserver.mockClear();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useScrollAnimation());
    
    expect(result.current.elementRef).toBeDefined();
    expect(result.current.isVisible).toBe(false);
    expect(result.current.animationState).toBe('idle');
    expect(result.current.animationClasses).toEqual({
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-0 translate-y-8',
      complete: 'opacity-100 translate-y-0'
    });
  });

  it('should accept custom configuration', () => {
    const config = {
      delay: 200,
      duration: 800,
      threshold: 0.5
    };
    
    const { result } = renderHook(() => useScrollAnimation(config));
    
    expect(result.current.style.transitionDelay).toBe('200ms');
    expect(result.current.style.transitionDuration).toBe('800ms');
  });
});

describe('useStaggeredAnimation', () => {
  it('should initialize with correct values for multiple items', () => {
    const itemCount = 3;
    const { result } = renderHook(() => useStaggeredAnimation(itemCount));
    
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.isVisible).toBe(false);
    expect(typeof result.current.getItemAnimation).toBe('function');
  });

  it('should calculate correct delays for staggered items', () => {
    const itemCount = 3;
    const stagger = 150;
    const { result } = renderHook(() => 
      useStaggeredAnimation(itemCount, { stagger })
    );
    
    const firstItemAnimation = result.current.getItemAnimation(0);
    const secondItemAnimation = result.current.getItemAnimation(1);
    
    expect(firstItemAnimation.style.transitionDelay).toBe('0ms');
    expect(secondItemAnimation.style.transitionDelay).toBe('150ms');
  });
});