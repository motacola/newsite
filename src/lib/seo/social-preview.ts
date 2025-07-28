import { Project } from '@/lib/types';

// Generate Open Graph image URL for projects
export function generateProjectOGImage(project: Project): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com';
  
  // Use existing project hero image or generate dynamic OG image
  if (project.media.hero) {
    return `${baseUrl}${project.media.hero}`;
  }
  
  // Generate dynamic OG image URL (you can implement this with a service like Vercel OG)
  const params = new URLSearchParams({
    title: project.title,
    client: project.client,
    category: project.category,
    technologies: project.technologies.slice(0, 3).join(', '),
  });
  
  return `${baseUrl}/api/og/project?${params.toString()}`;
}

// Generate Twitter Card image URL
export function generateProjectTwitterImage(project: Project): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com';
  
  if (project.media.hero) {
    return `${baseUrl}${project.media.hero}`;
  }
  
  const params = new URLSearchParams({
    title: project.title,
    client: project.client,
    type: 'twitter',
  });
  
  return `${baseUrl}/api/og/project?${params.toString()}`;
}

// Generate shareable URLs with tracking parameters
export function generateShareableUrl(
  path: string,
  platform: string,
  campaign?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com';
  const url = new URL(path, baseUrl);
  
  // Add UTM parameters for tracking
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', campaign || 'portfolio_share');
  
  return url.toString();
}

// Generate rich preview data for different content types
export function generateRichPreviewData(
  type: 'project' | 'experience' | 'showreel' | 'home',
  data?: any
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com';
  
  switch (type) {
    case 'project':
      if (!data) return null;
      return {
        title: `${data.title} - AI Project Showcase`,
        description: data.shortDescription || data.description.substring(0, 160),
        image: generateProjectOGImage(data),
        url: `${baseUrl}/projects/${data.id}`,
        type: 'article',
        author: 'Christopher Belgrave',
        publishedTime: data.dateStarted,
        modifiedTime: data.dateCompleted,
        tags: data.tags || [],
      };
      
    case 'experience':
      return {
        title: 'Christopher Belgrave - Professional Experience & CV',
        description: 'Comprehensive overview of professional experience in AI project management, digital marketing, and creative technology leadership.',
        image: `${baseUrl}/og-experience.jpg`,
        url: `${baseUrl}/experience`,
        type: 'profile',
      };
      
    case 'showreel':
      return {
        title: 'Christopher Belgrave - Video Showreel & Portfolio',
        description: 'Interactive video showcase of AI projects, digital campaigns, and creative technology implementations.',
        image: `${baseUrl}/og-showreel.jpg`,
        url: `${baseUrl}/showreel`,
        type: 'website',
      };
      
    case 'home':
    default:
      return {
        title: 'Christopher Belgrave - AI Innovation & Project Leadership',
        description: 'AI Project Manager and Digital Specialist transforming creative workflows through artificial intelligence and strategic project management.',
        image: `${baseUrl}/og-image.jpg`,
        url: baseUrl,
        type: 'website',
      };
  }
}

// Generate social media meta tags
export function generateSocialMetaTags(previewData: ReturnType<typeof generateRichPreviewData>) {
  if (!previewData) return [];
  
  return [
    // Open Graph
    { property: 'og:title', content: previewData.title },
    { property: 'og:description', content: previewData.description },
    { property: 'og:image', content: previewData.image },
    { property: 'og:url', content: previewData.url },
    { property: 'og:type', content: previewData.type },
    { property: 'og:site_name', content: 'Christopher Belgrave Portfolio' },
    
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: previewData.title },
    { name: 'twitter:description', content: previewData.description },
    { name: 'twitter:image', content: previewData.image },
    { name: 'twitter:creator', content: '@christopherbelgrave' },
    
    // Additional meta tags for specific content types
    ...(previewData.type === 'article' && previewData.author ? [
      { property: 'article:author', content: previewData.author },
      { property: 'article:published_time', content: previewData.publishedTime },
      { property: 'article:modified_time', content: previewData.modifiedTime },
      ...previewData.tags.map((tag: string) => ({ property: 'article:tag', content: tag })),
    ] : []),
  ];
}

// Generate JSON-LD for social sharing
export function generateSocialSharingStructuredData(previewData: ReturnType<typeof generateRichPreviewData>) {
  if (!previewData) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: previewData.title,
    description: previewData.description,
    url: previewData.url,
    image: previewData.image,
    author: {
      '@type': 'Person',
      name: 'Christopher Belgrave',
      jobTitle: 'AI Project Manager & Digital Specialist',
    },
    publisher: {
      '@type': 'Person',
      name: 'Christopher Belgrave',
    },
    mainEntity: {
      '@type': previewData.type === 'article' ? 'Article' : 'WebPage',
      headline: previewData.title,
      description: previewData.description,
      image: previewData.image,
      author: {
        '@type': 'Person',
        name: 'Christopher Belgrave',
      },
      datePublished: previewData.publishedTime,
      dateModified: previewData.modifiedTime,
    },
  };
}

// Validate social media image dimensions
export function validateSocialImageDimensions(imageUrl: string): Promise<{
  isValidOG: boolean;
  isValidTwitter: boolean;
  dimensions: { width: number; height: number } | null;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = img;
      
      // Open Graph recommended: 1200x630 (1.91:1 ratio)
      const isValidOG = width >= 1200 && height >= 630 && (width / height) >= 1.91;
      
      // Twitter Card recommended: 1200x600 (2:1 ratio)
      const isValidTwitter = width >= 1200 && height >= 600 && (width / height) >= 1.5;
      
      resolve({
        isValidOG,
        isValidTwitter,
        dimensions: { width, height },
      });
    };
    
    img.onerror = () => {
      resolve({
        isValidOG: false,
        isValidTwitter: false,
        dimensions: null,
      });
    };
    
    img.src = imageUrl;
  });
}

// Generate social sharing analytics tracking
export function trackSocialShare(platform: string, contentType: string, contentId?: string) {
  // This would integrate with your analytics service (Google Analytics, etc.)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share', {
      method: platform,
      content_type: contentType,
      content_id: contentId || 'unknown',
    });
  }
  
  // You can also send to other analytics services here
  console.log(`Social share tracked: ${platform} - ${contentType} - ${contentId}`);
}