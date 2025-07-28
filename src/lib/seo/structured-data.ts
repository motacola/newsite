import { Project } from '@/lib/types';

// Base organization structured data
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Christopher Belgrave',
  jobTitle: 'AI Project Manager & Digital Specialist',
  description: 'AI Project Manager and Digital Specialist transforming creative workflows through artificial intelligence and strategic project management.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com',
  image: '/chris_profile.jpeg',
  sameAs: [
    'https://linkedin.com/in/christopherbelgrave',
    'https://github.com/christopherbelgrave',
    'https://twitter.com/christopherbelgrave',
  ],
  knowsAbout: [
    'Artificial Intelligence',
    'Machine Learning',
    'Project Management',
    'Digital Transformation',
    'Computer Vision',
    'Natural Language Processing',
    'Creative Technology',
    'Process Optimization',
    'Team Leadership',
    'Strategic Planning'
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'AI Project Manager',
    occupationLocation: {
      '@type': 'Place',
      name: 'Global Remote'
    },
    skills: [
      'Artificial Intelligence',
      'Project Management',
      'Digital Strategy',
      'Team Leadership',
      'Process Optimization',
      'Technology Implementation'
    ]
  },
  alumniOf: [
    {
      '@type': 'EducationalOrganization',
      name: 'University of Technology',
      url: 'https://university-example.edu'
    }
  ],
  award: [
    'AI Innovation Excellence Award 2024',
    'Digital Transformation Leader 2023',
    'Project Management Excellence 2023'
  ]
};

// Generate structured data for a project
export function generateProjectStructuredData(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${project.id}`,
    name: project.title,
    description: project.description,
    creator: {
      '@type': 'Person',
      name: 'Christopher Belgrave',
      jobTitle: 'AI Project Manager & Digital Specialist',
      url: process.env.NEXT_PUBLIC_SITE_URL
    },
    dateCreated: project.dateStarted,
    dateModified: project.dateCompleted,
    datePublished: project.dateCompleted,
    keywords: project.technologies.join(', '),
    about: project.tags?.join(', '),
    image: {
      '@type': 'ImageObject',
      url: project.media.hero,
      caption: `${project.title} - ${project.client}`
    },
    video: project.media.video ? {
      '@type': 'VideoObject',
      name: `${project.title} Demo`,
      description: `Interactive demonstration of ${project.title}`,
      thumbnailUrl: project.media.hero,
      contentUrl: project.media.video,
      uploadDate: project.dateCompleted
    } : undefined,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Christopher Belgrave Portfolio',
      url: process.env.NEXT_PUBLIC_SITE_URL
    },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: project.title,
      applicationCategory: 'AI Application',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: project.businessImpact ? {
        '@type': 'AggregateRating',
        ratingValue: '5',
        bestRating: '5',
        worstRating: '1',
        ratingCount: '1'
      } : undefined
    },
    workExample: project.interactive ? {
      '@type': 'CreativeWork',
      name: `${project.title} Interactive Demo`,
      url: project.interactive.url,
      description: project.interactive.features?.join(', ')
    } : undefined,
    citation: project.testimonial ? {
      '@type': 'Review',
      reviewBody: project.testimonial.quote,
      author: {
        '@type': 'Person',
        name: project.testimonial.author,
        jobTitle: project.testimonial.role,
        worksFor: {
          '@type': 'Organization',
          name: project.testimonial.company
        }
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      }
    } : undefined
  };
}

// Generate structured data for AI capabilities
export function generateAICapabilityStructuredData(project: Project) {
  if (!project.aiCapabilities) return null;

  return project.aiCapabilities.map(capability => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${project.title} - ${capability.type.toUpperCase()} System`,
    description: capability.description,
    applicationCategory: 'AI/ML Application',
    operatingSystem: 'Web Browser',
    creator: {
      '@type': 'Person',
      name: 'Christopher Belgrave'
    },
    isPartOf: {
      '@type': 'CreativeWork',
      name: project.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${project.id}`
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Accuracy',
        value: `${capability.accuracy}%`
      },
      {
        '@type': 'PropertyValue',
        name: 'Model Type',
        value: capability.modelType
      },
      {
        '@type': 'PropertyValue',
        name: 'Processing Time',
        value: capability.processingTime
      },
      {
        '@type': 'PropertyValue',
        name: 'Confidence',
        value: `${capability.confidence}%`
      }
    ]
  }));
}

// Generate structured data for professional experience
export function generateExperienceStructuredData(experiences: any[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Christopher Belgrave',
    hasOccupation: experiences.map(exp => ({
      '@type': 'Occupation',
      name: exp.title,
      occupationLocation: {
        '@type': 'Place',
        name: exp.location || 'Remote'
      },
      estimatedSalary: exp.salary ? {
        '@type': 'MonetaryAmountDistribution',
        name: exp.salary
      } : undefined,
      experienceRequirements: exp.skills?.join(', '),
      responsibilities: exp.achievements?.join(', '),
      skills: exp.skills?.join(', ')
    })),
    worksFor: experiences.map(exp => ({
      '@type': 'Organization',
      name: exp.company,
      description: exp.description,
      employee: {
        '@type': 'Person',
        name: 'Christopher Belgrave',
        jobTitle: exp.title,
        startDate: exp.duration.start,
        endDate: exp.duration.end
      }
    }))
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL}${item.url}`
    }))
  };
}

// Generate FAQ structured data for common questions
export function generateFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What AI technologies does Christopher Belgrave specialize in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Christopher specializes in Computer Vision, Natural Language Processing, Machine Learning, TensorFlow, PyTorch, and AI-powered automation systems for creative and business applications.'
        }
      },
      {
        '@type': 'Question',
        name: 'What types of projects has Christopher managed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Christopher has managed AI-powered AR beauty experiences, automated video editing systems, content optimization engines, and digital transformation projects for major brands in advertising, gaming, and technology sectors.'
        }
      },
      {
        '@type': 'Question',
        name: 'How can I collaborate with Christopher on AI projects?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can reach out through the contact form on this website or connect via LinkedIn. Christopher is available for AI project management, digital transformation consulting, and creative technology implementation.'
        }
      },
      {
        '@type': 'Question',
        name: 'What makes Christopher\'s approach to AI project management unique?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Christopher combines technical AI expertise with strategic project management, focusing on measurable business outcomes, user experience optimization, and seamless integration of AI technologies into existing workflows.'
        }
      }
    ]
  };
}

// Generate website structured data
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Christopher Belgrave Portfolio',
    description: 'AI Project Manager and Digital Specialist portfolio showcasing innovative AI implementations and project management expertise.',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    author: {
      '@type': 'Person',
      name: 'Christopher Belgrave'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    mainEntity: {
      '@type': 'Person',
      name: 'Christopher Belgrave',
      jobTitle: 'AI Project Manager & Digital Specialist',
      url: process.env.NEXT_PUBLIC_SITE_URL
    }
  };
}

// Generate portfolio collection structured data
export function generatePortfolioStructuredData(projects: Project[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: 'Christopher Belgrave AI Project Portfolio',
    description: 'Collection of AI and digital transformation projects managed by Christopher Belgrave.',
    creator: {
      '@type': 'Person',
      name: 'Christopher Belgrave'
    },
    hasPart: projects.map(project => ({
      '@type': 'CreativeWork',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${project.id}`,
      name: project.title,
      description: project.shortDescription,
      dateCreated: project.dateStarted,
      dateModified: project.dateCompleted,
      keywords: project.technologies.join(', ')
    }))
  };
}