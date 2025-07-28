import { Project } from '@/lib/types';

// Generate shareable URLs with proper metadata and tracking
export function generateShareableProjectUrl(project: Project, platform: string = 'direct'): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com';
  const url = new URL(`/projects/${project.id}`, baseUrl);
  
  // Add UTM parameters for tracking
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'project_share');
  url.searchParams.set('utm_content', project.id);
  
  return url.toString();
}

// Generate shareable URLs for different page types
export function generateShareablePageUrl(
  path: string, 
  platform: string = 'direct',
  campaign: string = 'page_share'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com';
  const url = new URL(path, baseUrl);
  
  // Add UTM parameters for tracking
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', campaign);
  
  return url.toString();
}

// Generate social media specific sharing data
export function generateSocialSharingData(
  type: 'project' | 'experience' | 'showreel' | 'home' | 'contact',
  data?: any
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com';
  
  const sharingData = {
    project: {
      title: data ? `${data.title} - AI Project by Christopher Belgrave` : 'AI Project Showcase',
      description: data?.shortDescription || data?.description || 'Innovative AI project showcasing cutting-edge technology and measurable business impact.',
      hashtags: ['AI', 'ProjectManagement', 'Innovation', ...(data?.tags?.slice(0, 3) || [])],
      url: data ? `${baseUrl}/projects/${data.id}` : `${baseUrl}/projects`,
      image: data?.media?.hero || `${baseUrl}/og-project.jpg`,
    },
    experience: {
      title: 'Christopher Belgrave - Professional Experience & CV',
      description: 'Comprehensive overview of professional experience in AI project management, digital marketing, and creative technology leadership.',
      hashtags: ['AI', 'ProjectManagement', 'DigitalMarketing', 'Experience', 'CV'],
      url: `${baseUrl}/experience`,
      image: `${baseUrl}/og-experience.jpg`,
    },
    showreel: {
      title: 'Christopher Belgrave - Video Showreel & Portfolio',
      description: 'Interactive video showcase of AI projects, digital campaigns, and creative technology implementations.',
      hashtags: ['VideoShowreel', 'Portfolio', 'AI', 'DigitalCampaigns', 'CreativeTechnology'],
      url: `${baseUrl}/showreel`,
      image: `${baseUrl}/og-showreel.jpg`,
    },
    contact: {
      title: 'Contact Christopher Belgrave - AI & Digital Transformation Expert',
      description: 'Get in touch for AI project management, digital transformation consulting, and creative technology collaboration opportunities.',
      hashtags: ['AI', 'Consulting', 'ProjectManagement', 'Contact', 'Collaboration'],
      url: `${baseUrl}/contact`,
      image: `${baseUrl}/og-contact.jpg`,
    },
    home: {
      title: 'Christopher Belgrave - AI Innovation & Project Leadership',
      description: 'AI Project Manager and Digital Specialist transforming creative workflows through artificial intelligence and strategic project management.',
      hashtags: ['AI', 'ProjectManagement', 'Innovation', 'DigitalTransformation', 'Leadership'],
      url: baseUrl,
      image: `${baseUrl}/og-image.jpg`,
    },
  };

  return sharingData[type] || sharingData.home;
}

// Platform-specific sharing URLs
export const socialPlatforms = {
  twitter: {
    name: 'Twitter',
    icon: '𝕏',
    color: 'hover:bg-black hover:text-white',
    generateUrl: (data: ReturnType<typeof generateSocialSharingData>) => {
      const text = encodeURIComponent(data.title);
      const hashtags = encodeURIComponent(data.hashtags.join(','));
      return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(data.url)}&hashtags=${hashtags}`;
    },
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: 'hover:bg-blue-600 hover:text-white',
    generateUrl: (data: ReturnType<typeof generateSocialSharingData>) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}&summary=${encodeURIComponent(data.description)}`;
    },
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: 'hover:bg-blue-500 hover:text-white',
    generateUrl: (data: ReturnType<typeof generateSocialSharingData>) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(`${data.title} - ${data.description}`)}`;
    },
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: 'hover:bg-green-500 hover:text-white',
    generateUrl: (data: ReturnType<typeof generateSocialSharingData>) => {
      const text = encodeURIComponent(`${data.title} - ${data.url}`);
      return `https://wa.me/?text=${text}`;
    },
  },
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    color: 'hover:bg-blue-400 hover:text-white',
    generateUrl: (data: ReturnType<typeof generateSocialSharingData>) => {
      return `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`;
    },
  },
  reddit: {
    name: 'Reddit',
    icon: '🔴',
    color: 'hover:bg-orange-500 hover:text-white',
    generateUrl: (data: ReturnType<typeof generateSocialSharingData>) => {
      return `https://reddit.com/submit?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`;
    },
  },
};

// Track social sharing events
export function trackSocialShare(
  platform: string,
  contentType: string,
  contentId?: string,
  customData?: Record<string, any>
) {
  // Google Analytics 4 tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share', {
      method: platform,
      content_type: contentType,
      content_id: contentId || 'unknown',
      custom_parameter_1: customData?.campaign || 'unknown',
      custom_parameter_2: customData?.source || 'unknown',
    });
  }

  // Custom analytics tracking
  if (typeof window !== 'undefined') {
    // You can add other analytics services here
    console.log('Social share tracked:', {
      platform,
      contentType,
      contentId,
      timestamp: new Date().toISOString(),
      ...customData,
    });
  }
}

// Generate rich preview metadata for social platforms
export function generateRichPreviewMetadata(
  type: 'project' | 'experience' | 'showreel' | 'home' | 'contact',
  data?: any
) {
  const sharingData = generateSocialSharingData(type, data);
  
  return {
    // Open Graph
    'og:title': sharingData.title,
    'og:description': sharingData.description,
    'og:image': sharingData.image,
    'og:url': sharingData.url,
    'og:type': type === 'project' ? 'article' : 'website',
    'og:site_name': 'Christopher Belgrave Portfolio',
    
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': sharingData.title,
    'twitter:description': sharingData.description,
    'twitter:image': sharingData.image,
    'twitter:creator': '@christopherbelgrave',
    
    // Additional metadata
    'article:author': type === 'project' ? 'Christopher Belgrave' : undefined,
    'article:published_time': data?.dateStarted || undefined,
    'article:modified_time': data?.dateCompleted || undefined,
    'article:tag': type === 'project' ? data?.tags?.join(',') : undefined,
  };
}