// Core data types for the portfolio application

export interface Project {
  id: string;
  title: string;
  client: string;
  category: 'ai' | 'digital' | 'production';
  description: string;
  shortDescription: string;
  media: {
    hero: string;
    gallery: string[];
    video?: string;
    thumbnail?: string;
  };
  metrics: ProjectMetric[];
  technologies: string[];
  timeline: string;
  featured: boolean;
  status?: 'completed' | 'in-progress' | 'planned';
  dateCompleted?: string;
  dateStarted?: string;
  tags?: string[];
  interactive?: {
    type: 'demo' | 'visualization' | 'comparison';
    url?: string;
    data?: any;
    embedCode?: string;
    previewImage?: string;
    features?: string[];
  };
  challenges?: string[];
  outcomes?: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar?: string;
  };
  // Enhanced AI-specific fields
  aiCapabilities?: {
    type: 'computer-vision' | 'nlp' | 'machine-learning' | 'deep-learning' | 'automation' | 'prediction' | 'recommendation' | 'optimization';
    description: string;
    accuracy?: number;
    trainingData?: string;
    modelType?: string;
    processingTime?: string;
    dataVolume?: string;
    confidence?: number;
    features?: string[];
  }[];
  businessImpact?: {
    roi?: string;
    costSavings?: string;
    timeReduction?: string;
    userGrowth?: string;
    revenueIncrease?: string;
    productivityGain?: string;
    errorReduction?: string;
    customerSatisfaction?: string;
    marketShare?: string;
  };
  technicalDetails?: {
    architecture?: string;
    deployment?: string;
    scalability?: string;
    performance?: string;
    dataProcessing?: string;
    security?: string;
    monitoring?: string;
    apiEndpoints?: string[];
    databases?: string[];
    cloudServices?: string[];
  };
  awards?: {
    name: string;
    organization: string;
    year: string;
    category?: string;
  }[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  duration: {
    start: string;
    end: string;
  };
  description: string;
  achievements: string[];
  skills: string[];
  projects: string[]; // Project IDs
  featured: boolean;
  type?: 'full-time' | 'contract' | 'freelance' | 'internship';
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry?: string;
  responsibilities?: string[];
  technologies?: string[];
  teamSize?: number;
  reportingTo?: string;
  directReports?: number;
  salary?: {
    currency: string;
    amount?: number;
    range?: {
      min: number;
      max: number;
    };
  };
  companyLogo?: string;
  companyWebsite?: string;
  linkedInUrl?: string;
  references?: {
    name: string;
    title: string;
    email?: string;
    phone?: string;
    linkedIn?: string;
  }[];
  tags?: string[];
  isRemote?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CVData {
  pdfUrl: string;
  lastUpdated: string;
  sections: {
    summary: string;
    experiences: Experience[];
    skills: string[];
    education: Education[];
    certifications: Certification[];
  };
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  duration: {
    start: string;
    end: string;
  };
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  description?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  duration?: string;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

// Component prop types
export interface HeroProps {
  title: string;
  subtitle: string;
  description: string;
  ctaButtons: CTAButton[];
  typewriterTexts: string[];
  backgroundMedia?: MediaItem[];
  showMediaControls?: boolean;
  responsiveBreakpoints?: {
    mobile?: MediaItem[];
    tablet?: MediaItem[];
    desktop?: MediaItem[];
  };
  enableIntersectionObserver?: boolean;
  lazyLoad?: boolean;
  videoQuality?: 'auto' | 'high' | 'medium' | 'low';
  enablePictureInPicture?: boolean;
  enableFullscreen?: boolean;
}

export interface CTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
  icon?: string;
}

export interface InteractiveElement {
  type: 'particle' | 'geometric' | 'typewriter';
  config: Record<string, any>;
}

export interface AIProjectProps {
  title: string;
  description: string;
  metrics: ProjectMetric[];
  media: MediaItem[];
  interactiveDemo?: string;
  technologies: string[];
}

export interface ProjectMetric {
  label: string;
  value: string;
  improvement?: string;
  icon?: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  category?: 'performance' | 'engagement' | 'business' | 'technical';
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  alt?: string;
  caption?: string;
}

export interface TimelineProps {
  experiences: Experience[];
  layout: 'horizontal' | 'vertical';
  interactive: boolean;
}

export interface ShowreelProps {
  videos: VideoItem[];
  categories: Category[];
  layout: 'grid' | 'masonry' | 'carousel';
}

// Enhanced component interfaces for AI Project Showcase
export interface ProjectCardProps {
  project: Project;
  variant?: 'default' | 'featured' | 'compact';
  onExpand?: (project: Project) => void;
  showFullDetails?: boolean;
}

export interface TechnologyStackProps {
  technologies: string[];
  variant?: 'default' | 'compact' | 'detailed';
  showCategories?: boolean;
  interactive?: boolean;
}

export interface MetricsDisplayProps {
  metrics: ProjectMetric[];
  variant?: 'default' | 'compact' | 'detailed';
  animated?: boolean;
  showComparison?: boolean;
}

export interface ProjectGalleryProps {
  media: {
    hero: string;
    gallery: string[];
    video?: string;
    thumbnail?: string;
  };
  title: string;
  onMediaClick?: (mediaUrl: string, type: 'image' | 'video') => void;
}

export interface InteractiveDemoProps {
  interactive?: {
    type: 'demo' | 'visualization' | 'comparison';
    url?: string;
    data?: any;
    embedCode?: string;
  };
  title: string;
  onLaunch?: () => void;
}

export interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

// Validation and Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
}

// Experience Data Management Types
export interface ExperienceFilter {
  company?: string;
  skills?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  type?: Experience['type'];
  industry?: string;
  featured?: boolean;
  isRemote?: boolean;
  tags?: string[];
}

export interface ExperienceSortOptions {
  field: 'startDate' | 'endDate' | 'company' | 'title' | 'duration';
  direction: 'asc' | 'desc';
}

export interface ExperienceStats {
  totalExperiences: number;
  totalYears: number;
  companiesWorkedAt: number;
  uniqueSkills: number;
  featuredExperiences: number;
  averageTenure: number;
  skillFrequency: Record<string, number>;
  companyTypes: Record<string, number>;
  industryDistribution: Record<string, number>;
}

export interface CVSyncOptions {
  includeAllExperiences?: boolean;
  maxExperiences?: number;
  includeReferences?: boolean;
  formatForPrint?: boolean;
  customSections?: string[];
}

export interface CVSyncResult {
  success: boolean;
  cvData: CVData;
  warnings: string[];
  errors: string[];
  lastSyncDate: string;
}
