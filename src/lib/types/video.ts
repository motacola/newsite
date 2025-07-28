export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoId: string; // YouTube video ID
  thumbnail?: string;
  category: VideoCategory;
  duration?: string;
  publishedAt: string;
  featured: boolean;
  tags: string[];
  metrics?: {
    views?: number;
    engagement?: number;
  };
}

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
}

export interface VideoPlayerProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

export interface VideoShowcaseProps {
  videos: VideoItem[];
  categories: VideoCategory[];
  layout?: 'grid' | 'masonry' | 'carousel' | 'list';
  showFilters?: boolean;
  showSearch?: boolean;
  itemsPerPage?: number;
  onItemClick?: (item: VideoItem, index: number) => void;
}

export interface VideoModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface VideoAnalytics {
  videoId: string;
  event: 'play' | 'pause' | 'ended' | 'seek' | 'fullscreen';
  timestamp: number;
  duration?: number;
  currentTime?: number;
}