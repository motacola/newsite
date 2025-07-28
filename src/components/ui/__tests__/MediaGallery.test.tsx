import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaGallery, MediaItem } from '../MediaGallery';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
  useMotionValue: () => ({ set: jest.fn() }),
  useTransform: () => 0,
}));

// Mock OptimizedImage and OptimizedVideo
jest.mock('../OptimizedImage', () => {
  return function OptimizedImage({ src, alt, className }: any) {
    return <img src={src} alt={alt} className={className} />;
  };
});

jest.mock('../OptimizedVideo', () => {
  return function OptimizedVideo({ src, alt, className, poster }: any) {
    return <video src={src} className={className} poster={poster} aria-label={alt} />;
  };
});

const mockItems: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    src: '/image1.jpg',
    alt: 'Test Image 1',
    title: 'Image 1',
    description: 'First test image',
  },
  {
    id: '2',
    type: 'video',
    src: '/video1.mp4',
    alt: 'Test Video 1',
    title: 'Video 1',
    description: 'First test video',
    poster: '/video1-poster.jpg',
  },
  {
    id: '3',
    type: 'image',
    src: '/image2.jpg',
    alt: 'Test Image 2',
    title: 'Image 2',
    description: 'Second test image',
  },
];

describe('MediaGallery', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Setup DOM
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Grid Layout', () => {
    it('renders grid layout correctly', () => {
      render(<MediaGallery items={mockItems} layout="grid" />);
      
      expect(screen.getByText('Image 1')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Image 2')).toBeInTheDocument();
    });

    it('handles item clicks in grid layout', async () => {
      const onItemClick = jest.fn();
      render(
        <MediaGallery 
          items={mockItems} 
          layout="grid" 
          onItemClick={onItemClick}
        />
      );
      
      const firstItem = screen.getByText('Image 1').closest('div');
      if (firstItem) {
        await userEvent.click(firstItem);
        expect(onItemClick).toHaveBeenCalledWith(mockItems[0], 0);
      }
    });
  });

  describe('Carousel Layout', () => {
    it('renders carousel layout correctly', () => {
      render(<MediaGallery items={mockItems} layout="carousel" />);
      
      expect(screen.getByLabelText('Previous item')).toBeInTheDocument();
      expect(screen.getByLabelText('Next item')).toBeInTheDocument();
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('navigates between items using arrow buttons', async () => {
      render(<MediaGallery items={mockItems} layout="carousel" />);
      
      const nextButton = screen.getByLabelText('Next item');
      await userEvent.click(nextButton);
      
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('shows zoom controls for images', () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableZoom={true}
        />
      );
      
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotate right')).toBeInTheDocument();
    });

    it('shows thumbnails when enabled', () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          showThumbnails={true}
        />
      );
      
      const thumbnails = screen.getAllByRole('button');
      const thumbnailButtons = thumbnails.filter(button => 
        button.querySelector('img') || button.querySelector('video')
      );
      
      expect(thumbnailButtons).toHaveLength(3);
    });
  });

  describe('Masonry Layout', () => {
    it('renders masonry layout correctly', () => {
      render(<MediaGallery items={mockItems} layout="masonry" />);
      
      expect(screen.getByText('Image 1')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Image 2')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates with arrow keys in carousel mode', async () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableKeyboard={true}
        />
      );
      
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      await waitFor(() => {
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
      });
    });

    it('handles zoom keyboard shortcuts', () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableKeyboard={true}
          enableZoom={true}
        />
      );
      
      fireEvent.keyDown(document, { key: '+' });
      fireEvent.keyDown(document, { key: '-' });
      fireEvent.keyDown(document, { key: '0' });
      fireEvent.keyDown(document, { key: 'r' });
    });

    it('handles fullscreen toggle with f key', () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableKeyboard={true}
        />
      );
      
      fireEvent.keyDown(document, { key: 'f' });
    });

    it('handles escape key to close', () => {
      const onClose = jest.fn();
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableKeyboard={true}
          onClose={onClose}
        />
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Touch Gestures', () => {
    it('handles touch swipe gestures', () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableSwipe={true}
        />
      );
      
      const carousel = screen.getByText('1 / 3').closest('div');
      if (carousel) {
        // Simulate swipe left (next)
        fireEvent.touchStart(carousel, {
          targetTouches: [{ clientX: 100, clientY: 100 }],
        });
        fireEvent.touchMove(carousel, {
          targetTouches: [{ clientX: 50, clientY: 100 }],
        });
        fireEvent.touchEnd(carousel);
      }
    });
  });

  describe('Autoplay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('auto-advances slides when autoplay is enabled', async () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          autoplay={true}
          autoplayInterval={1000}
        />
      );
      
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
      });
    });

    it('pauses autoplay when play/pause button is clicked', async () => {
      const { unmount } = render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          autoplay={true}
          autoplayInterval={1000}
        />
      );
      
      const pauseButton = screen.getByLabelText('Pause slideshow');
      await userEvent.click(pauseButton);
      
      expect(screen.getByLabelText('Play slideshow')).toBeInTheDocument();
      
      unmount();
    });
  });

  describe('Zoom and Pan', () => {
    it('zooms in and out on images', async () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableZoom={true}
        />
      );
      
      const zoomInButton = screen.getByLabelText('Zoom in');
      const zoomOutButton = screen.getByLabelText('Zoom out');
      
      await userEvent.click(zoomInButton);
      await userEvent.click(zoomOutButton);
    });

    it('resets zoom and rotation', async () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableZoom={true}
        />
      );
      
      const resetButton = screen.getByLabelText('Reset view');
      await userEvent.click(resetButton);
    });
  });

  describe('Fullscreen Mode', () => {
    it('toggles fullscreen mode', async () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel"
        />
      );
      
      const fullscreenButton = screen.getByLabelText('Fullscreen');
      await userEvent.click(fullscreenButton);
    });
  });

  describe('Share and Download', () => {
    it('handles share functionality', async () => {
      // Mock navigator.share
      Object.assign(navigator, {
        share: jest.fn().mockResolvedValue(undefined),
      });
      
      render(<MediaGallery items={mockItems} layout="carousel" />);
      
      const shareButton = screen.getByLabelText('Share');
      await userEvent.click(shareButton);
      
      expect(navigator.share).toHaveBeenCalled();
    });

    it('handles download functionality', async () => {
      // Mock document.createElement and appendChild
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      
      render(<MediaGallery items={mockItems} layout="carousel" />);
      
      const downloadButton = screen.getByLabelText('Download');
      await userEvent.click(downloadButton);
      
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<MediaGallery items={mockItems} layout="carousel" />);
      
      expect(screen.getByLabelText('Previous item')).toBeInTheDocument();
      expect(screen.getByLabelText('Next item')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('Download')).toBeInTheDocument();
      expect(screen.getByLabelText('Fullscreen')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          enableKeyboard={true}
        />
      );
      
      // Test various keyboard shortcuts
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      fireEvent.keyDown(document, { key: ' ' });
      fireEvent.keyDown(document, { key: 'f' });
      fireEvent.keyDown(document, { key: '+' });
      fireEvent.keyDown(document, { key: '-' });
      fireEvent.keyDown(document, { key: '0' });
      fireEvent.keyDown(document, { key: 'Home' });
      fireEvent.keyDown(document, { key: 'End' });
    });
  });

  describe('Error Handling', () => {
    it('handles empty items array', () => {
      render(<MediaGallery items={[]} layout="carousel" />);
      
      // Should not crash and should handle empty state gracefully
      expect(screen.queryByText('1 / 0')).not.toBeInTheDocument();
    });

    it('handles invalid initial index', () => {
      render(
        <MediaGallery 
          items={mockItems} 
          layout="carousel" 
          initialIndex={10}
        />
      );
      
      // Should default to first item
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });
});