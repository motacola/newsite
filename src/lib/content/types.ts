// Enhanced content management types with versioning and validation

export interface ContentVersion {
  version: string;
  timestamp: string;
  author: string;
  changes: string[];
  hash: string;
}

export interface ContentMetadata {
  id: string;
  type: 'project' | 'experience' | 'skill' | 'education' | 'certification' | 'video' | 'testimonial';
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  version: ContentVersion;
  tags: string[];
  categories: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

export interface ContentValidationRule {
  field: string;
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ContentSchema {
  type: string;
  fields: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
    required: boolean;
    validation?: ContentValidationRule[];
    default?: any;
  }>;
  validation: ContentValidationRule[];
}

export interface ContentError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ContentValidationResult {
  isValid: boolean;
  errors: ContentError[];
  warnings: ContentError[];
  data?: any;
}

// Enhanced Project interface with content management features
export interface ManagedProject extends ContentMetadata {
  type: 'project';
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
  projectStatus: 'completed' | 'in-progress' | 'planned';
  dateCompleted?: string;
  dateStarted?: string;
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
  aiCapabilities?: AICapability[];
  businessImpact?: BusinessImpact;
  technicalDetails?: TechnicalDetails;
  awards?: Award[];
  relatedProjects?: string[];
  collaborators?: Collaborator[];
}

// Enhanced Experience interface with content management features
export interface ManagedExperience extends ContentMetadata {
  type: 'experience';
  company: string;
  location?: string;
  duration: {
    start: string;
    end: string;
  };
  description: string;
  achievements: string[];
  skills: string[];
  projects: string[];
  employmentType: 'full-time' | 'contract' | 'freelance' | 'internship';
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
  references?: Reference[];
  isRemote?: boolean;
}

// Enhanced Skill interface with content management features
export interface ManagedSkill extends ContentMetadata {
  type: 'skill';
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  description?: string;
  relatedSkills?: string[];
  projects?: string[];
  certifications?: string[];
  endorsements?: {
    count: number;
    sources: string[];
  };
  lastUsed?: string;
  trending?: boolean;
}

// Supporting interfaces
export interface ProjectMetric {
  label: string;
  value: string;
  improvement?: string;
  icon?: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  category?: 'performance' | 'engagement' | 'business' | 'technical';
}

export interface AICapability {
  type: 'computer-vision' | 'nlp' | 'machine-learning' | 'deep-learning' | 'automation' | 'prediction' | 'recommendation' | 'optimization';
  description: string;
  accuracy?: number;
  trainingData?: string;
  modelType?: string;
  processingTime?: string;
  dataVolume?: string;
  confidence?: number;
  features?: string[];
}

export interface BusinessImpact {
  roi?: string;
  costSavings?: string;
  timeReduction?: string;
  userGrowth?: string;
  revenueIncrease?: string;
  productivityGain?: string;
  errorReduction?: string;
  customerSatisfaction?: string;
  marketShare?: string;
}

export interface TechnicalDetails {
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
}

export interface Award {
  name: string;
  organization: string;
  year: string;
  category?: string;
}

export interface Collaborator {
  name: string;
  role: string;
  company?: string;
  linkedIn?: string;
  avatar?: string;
}

export interface Reference {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
}

// Content collection interfaces
export interface ContentCollection<T extends ContentMetadata> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface ContentQuery {
  type?: string;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  tags?: string[];
  categories?: string[];
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface ContentUpdateOptions {
  updateVersion?: boolean;
  validateBeforeUpdate?: boolean;
  publishImmediately?: boolean;
  notifySubscribers?: boolean;
  createBackup?: boolean;
}

export interface ContentBackup {
  id: string;
  contentId: string;
  contentType: string;
  data: any;
  version: ContentVersion;
  createdAt: string;
  reason: 'manual' | 'auto' | 'pre-update' | 'scheduled';
}