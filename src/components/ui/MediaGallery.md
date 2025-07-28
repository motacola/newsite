# MediaGallery Component

A comprehensive, accessible media gallery component with support for images and videos, multiple layout options, zoom/pan functionality, keyboard navigation, and touch gestures.

## Features

### Core Functionality
- **Multiple Layout Options**: Grid, Masonry, and Carousel layouts
- **Mixed Media Support**: Images and videos in the same gallery
- **Responsive Design**: Adapts to different screen sizes automatically
- **Optimized Media Loading**: Integration with OptimizedImage and OptimizedVideo components

### Interactive Features
- **Swipeable Carousels**: Touch and mouse drag support for navigation
- **Zoom and Pan**: Detailed viewing with mouse wheel and touch pinch support
- **Image Rotation**: Rotate images in 90-degree increments
- **Fullscreen Mode**: Immersive viewing experience
- **Autoplay**: Automatic slideshow with customizable intervals

### Accessibility
- **Keyboard Navigation**: Full keyboard support with intuitive shortcuts
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Logical tab order and focus indicators
- **Reduced Motion Support**: Respects user motion preferences

### Advanced Features
- **Progress Indicators**: Visual progress for autoplay and navigation
- **Thumbnail Navigation**: Quick access to specific items
- **Share Functionality**: Native sharing API with fallback
- **Download Support**: Direct media download capability
- **URL-based State**: Shareable links with current item state

## Props

### MediaItem Interface
```typescript
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  alt: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  // Video-specific props
  videoSources?: { src: string; type: string }[];
  poster?: string;
  // Image-specific props
  webpSrc?: string;
  avifSrc?: string;
}
```

### Component Props
```typescript
interface MediaGalleryProps {
  items: MediaItem[];
  initialIndex?: number;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: number;
  gap?: number;
  showThumbnails?: boolean;
  showControls?: boolean;
  showInfo?: boolean;
  enableZoom?: boolean;
  enableSwipe?: boolean;
  enableKeyboard?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  enableInfiniteLoop?: boolean;
  showProgress?: boolean;
  className?: string;
  onItemClick?: (item: MediaItem, index: number) => void;
  onClose?: () => void;
  onIndexChange?: (index: number) => void;
}
```

## Usage Examples

### Basic Grid Layout
```tsx
import { MediaGallery } from '@/components/ui';

const mediaItems = [
  {
    id: '1',
    type: 'image',
    src: '/images/project1.jpg',
    alt: 'Project screenshot',
    title: 'AI Dashboard',
  },
  // ... more items
];

<MediaGallery
  items={mediaItems}
  layout="grid"
  columns={3}
  gap={16}
/>
```

### Interactive Carousel
```tsx
<MediaGallery
  items={mediaItems}
  layout="carousel"
  showThumbnails={true}
  showControls={true}
  enableZoom={true}
  enableSwipe={true}
  enableKeyboard={true}
  autoplay={false}
  onItemClick={(item, index) => console.log('Clicked:', item.title)}
/>
```

### Masonry Layout
```tsx
<MediaGallery
  items={mediaItems}
  layout="masonry"
  columns={4}
  gap={12}
  onItemClick={(item, index) => {
    // Switch to carousel view for detailed viewing
    setViewMode('carousel');
    setCurrentIndex(index);
  }}
/>
```

### With Custom Event Handlers
```tsx
const [currentIndex, setCurrentIndex] = useState(0);

<MediaGallery
  items={mediaItems}
  layout="carousel"
  initialIndex={currentIndex}
  onIndexChange={setCurrentIndex}
  onClose={() => setViewMode('grid')}
  showProgress={true}
  autoplayInterval={5000}
/>
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate previous/next item |
| `↑` / `↓` | Navigate up/down in grid layout |
| `Space` | Play/pause autoplay or toggle fullscreen |
| `F` | Toggle fullscreen mode |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom and rotation |
| `R` | Rotate image right |
| `Shift + R` | Rotate image left |
| `Home` | Go to first item |
| `End` | Go to last item |
| `Escape` | Close gallery or exit fullscreen |

## Touch Gestures

- **Swipe Left/Right**: Navigate between items
- **Pinch**: Zoom in/out on images
- **Double Tap**: Toggle zoom
- **Pan**: Move zoomed images
- **Long Press**: Show context menu (if implemented)

## Responsive Behavior

The component automatically adapts to different screen sizes:

- **Mobile (< 640px)**: Single column, touch-optimized controls
- **Tablet (640px - 1024px)**: 2-3 columns, hybrid touch/mouse support
- **Desktop (> 1024px)**: Full feature set, keyboard shortcuts

## Performance Optimizations

- **Lazy Loading**: Images and videos load only when needed
- **Intersection Observer**: Efficient viewport detection
- **Optimized Formats**: WebP/AVIF support with fallbacks
- **Virtual Scrolling**: For large galleries (planned feature)
- **Memory Management**: Automatic cleanup of unused resources

## Accessibility Features

### WCAG 2.1 AA Compliance
- **Color Contrast**: All text meets minimum contrast ratios
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Comprehensive ARIA labeling
- **Focus Management**: Logical tab order and visible focus indicators

### Enhanced Accessibility
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **High Contrast**: Supports high contrast mode
- **Text Scaling**: Responsive to user font size preferences
- **Alternative Text**: Required alt text for all media

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Integration with Other Components

### With Project Showcase
```tsx
import { MediaGallery, ProjectCard } from '@/components/ui';

const ProjectShowcase = ({ project }) => (
  <div>
    <ProjectCard {...project} />
    <MediaGallery
      items={project.media}
      layout="carousel"
      showThumbnails={true}
    />
  </div>
);
```

### With Modal System
```tsx
const [isGalleryOpen, setIsGalleryOpen] = useState(false);

<Modal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)}>
  <MediaGallery
    items={mediaItems}
    layout="carousel"
    onClose={() => setIsGalleryOpen(false)}
  />
</Modal>
```

## Customization

### Styling
The component uses Tailwind CSS classes and can be customized through:
- Custom CSS classes via `className` prop
- Tailwind configuration overrides
- CSS custom properties for theming

### Extending Functionality
```tsx
// Custom hook for gallery state management
const useCustomGallery = (items) => {
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Custom logic here
  
  return { favorites, filters, /* ... */ };
};
```

## Testing

The component includes comprehensive tests covering:
- **Unit Tests**: Individual function testing
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: ARIA and keyboard navigation
- **Visual Regression Tests**: Layout and styling consistency
- **Performance Tests**: Loading and rendering benchmarks

## Future Enhancements

- **Virtual Scrolling**: For galleries with thousands of items
- **AI-Powered Tagging**: Automatic content categorization
- **Advanced Filters**: Search and filter capabilities
- **Social Features**: Comments and sharing integration
- **Analytics**: Usage tracking and insights