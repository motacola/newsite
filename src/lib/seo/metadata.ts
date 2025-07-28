import { Metadata } from 'next';
import { Project } from '@/lib/types';

// Base metadata configuration
export const baseMetadata: Metadata = {
  title: {
    template: '%s | Christopher Belgrave',
    default: 'Christopher Belgrave - AI Innovation & Project Leadership',
  },
  description: 'AI Project Manager and Digital Specialist transforming creative workflows through artificial intelligence and strategic project management. Delivering measurable results in advertising, gaming, and digital experiences.',
  keywords: [
    'AI Project Manager',
    'Artificial Intelligence',
    'Digital Transformation',
    'Creative Technology',
    'Project Management',
    'Machine Learning',
    'Computer Vision',
    'AR/VR Development',
    'Digital Marketing',
    'Innovation Leadership',
    'Technology Strategy',
    'Process Optimization'
  ],
  authors: [{ name: 'Christopher Belgrave' }],
  creator: 'Christopher Belgrave',
  publisher: 'Christopher Belgrave',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Christopher Belgrave Portfolio',
    title: 'Christopher Belgrave - AI Innovation & Project Leadership',
    description: 'AI Project Manager and Digital Specialist transforming creative workflows through artificial intelligence and strategic project management.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Christopher Belgrave - AI Expert and Project Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Christopher Belgrave - AI Innovation & Project Leadership',
    description: 'AI Project Manager and Digital Specialist transforming creative workflows through artificial intelligence.',
    images: ['/twitter-image.jpg'],
    creator: '@christopherbelgrave',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
};

// Generate metadata for project pages
export function generateProjectMetadata(project: Project): Metadata {
  const title = `${project.title} - AI Project Showcase`;
  const description = project.shortDescription || project.description.substring(0, 160);
  const url = `/projects/${project.id}`;
  const imageUrl = project.media.hero || '/og-image.jpg';

  return {
    title,
    description,
    keywords: [
      ...project.technologies,
      ...project.tags || [],
      'AI Project',
      'Case Study',
      project.client,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${project.title} - ${project.client}`,
        },
      ],
      publishedTime: project.dateStarted,
      modifiedTime: project.dateCompleted,
      authors: ['Christopher Belgrave'],
      tags: project.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

// Generate metadata for experience/CV pages
export function generateExperienceMetadata(): Metadata {
  return {
    title: 'Professional Experience & CV',
    description: 'Comprehensive overview of Christopher Belgrave\'s professional experience in AI project management, digital marketing, and creative technology leadership.',
    keywords: [
      'Professional Experience',
      'CV',
      'Resume',
      'Career Timeline',
      'AI Project Manager',
      'Digital Specialist',
      'Work History',
      'Professional Background'
    ],
    alternates: {
      canonical: '/experience',
    },
    openGraph: {
      type: 'profile',
      url: '/experience',
      title: 'Christopher Belgrave - Professional Experience & CV',
      description: 'Comprehensive overview of professional experience in AI project management and digital marketing.',
      images: [
        {
          url: '/og-experience.jpg',
          width: 1200,
          height: 630,
          alt: 'Christopher Belgrave Professional Experience Timeline',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Christopher Belgrave - Professional Experience & CV',
      description: 'Comprehensive overview of professional experience in AI project management and digital marketing.',
      images: ['/twitter-experience.jpg'],
    },
  };
}

// Generate metadata for showreel page
export function generateShowreelMetadata(): Metadata {
  return {
    title: 'Video Showreel & Portfolio',
    description: 'Interactive video showcase of Christopher Belgrave\'s AI projects, digital campaigns, and creative technology implementations.',
    keywords: [
      'Video Showreel',
      'Portfolio Videos',
      'AI Demonstrations',
      'Project Showcase',
      'Creative Technology',
      'Digital Campaigns',
      'Interactive Media'
    ],
    alternates: {
      canonical: '/showreel',
    },
    openGraph: {
      type: 'website',
      url: '/showreel',
      title: 'Christopher Belgrave - Video Showreel & Portfolio',
      description: 'Interactive video showcase of AI projects and creative technology implementations.',
      images: [
        {
          url: '/og-showreel.jpg',
          width: 1200,
          height: 630,
          alt: 'Christopher Belgrave Video Showreel',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Christopher Belgrave - Video Showreel & Portfolio',
      description: 'Interactive video showcase of AI projects and creative technology implementations.',
      images: ['/twitter-showreel.jpg'],
    },
  };
}

// Generate metadata for contact page
export function generateContactMetadata(): Metadata {
  return {
    title: 'Contact & Collaboration',
    description: 'Get in touch with Christopher Belgrave for AI project management, digital transformation consulting, and creative technology collaboration opportunities.',
    keywords: [
      'Contact',
      'Collaboration',
      'AI Consulting',
      'Project Management',
      'Digital Transformation',
      'Technology Consulting',
      'Partnership Opportunities'
    ],
    alternates: {
      canonical: '/contact',
    },
    openGraph: {
      type: 'website',
      url: '/contact',
      title: 'Contact Christopher Belgrave - AI & Digital Transformation Expert',
      description: 'Get in touch for AI project management and digital transformation consulting opportunities.',
      images: [
        {
          url: '/og-contact.jpg',
          width: 1200,
          height: 630,
          alt: 'Contact Christopher Belgrave',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contact Christopher Belgrave - AI & Digital Transformation Expert',
      description: 'Get in touch for AI project management and digital transformation consulting opportunities.',
      images: ['/twitter-contact.jpg'],
    },
  };
}

// Generate dynamic metadata based on route
export function generateDynamicMetadata(
  route: string,
  data?: any
): Metadata {
  switch (route) {
    case 'project':
      return data ? generateProjectMetadata(data) : baseMetadata;
    case 'experience':
      return generateExperienceMetadata();
    case 'showreel':
      return generateShowreelMetadata();
    case 'contact':
      return generateContactMetadata();
    default:
      return baseMetadata;
  }
}