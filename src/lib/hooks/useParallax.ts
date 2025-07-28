import { useEffect, useRef, useState } from 'react';

interface ParallaxConfig {
  speed?: number;
  direction?: 'up' | 'down';
  disabled?: boolean;
}

export function useParallax(config: ParallaxConfig = {}) {
  const { speed = 0.5, direction = 'up', disabled = false } = config;
  const elementRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      if (!elementRef.current) return;

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      
      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        const yPos = direction === 'up' ? rate : -rate;
        setOffset(yPos);
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, direction, disabled]);

  return {
    elementRef,
    style: {
      transform: `translateY(${offset}px)`,
      willChange: 'transform'
    }
  };
}

export function useParallaxMultiple(elements: Array<{ speed: number; direction?: 'up' | 'down' }>) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [offsets, setOffsets] = useState<number[]>(new Array(elements.length).fill(0));

  useEffect(() => {
    const handleScroll = () => {
      const newOffsets = elements.map((config, index) => {
        const element = refs.current[index];
        if (!element) return 0;

        const rect = element.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -config.speed;
        
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          return config.direction === 'down' ? -rate : rate;
        }
        return 0;
      });

      setOffsets(newOffsets);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [elements]);

  const getElementProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      refs.current[index] = el;
    },
    style: {
      transform: `translateY(${offsets[index]}px)`,
      willChange: 'transform'
    }
  });

  return { getElementProps };
}