import { Project } from '@/lib/types';
import { contentManager, ContentDataLoader, getProjects } from '@/lib/content';

// Legacy export for backward compatibility
export const aiProjects: Project[] = [
  {
    id: 'maybelline-chromaverse',
    title: 'Maybelline ChromaVerse',
    client: 'Maybelline',
    category: 'ai',
    description: 'Revolutionary AR beauty experience that transforms how users discover and try makeup. This immersive digital world combines cutting-edge AI color matching with engaging gaming mechanics, creating an entirely new category of beauty interaction.',
    shortDescription: 'Immersive AR beauty experience with AI-powered personalization',
    media: {
      hero: '/projects/maybelline-hero.jpg',
      gallery: [
        '/projects/maybelline-1.jpg',
        '/projects/maybelline-2.jpg',
        '/projects/maybelline-3.jpg'
      ],
      video: '/projects/maybelline-demo.mp4'
    },
    metrics: [
      {
        label: 'User Engagement',
        value: '340%',
        improvement: '+240%',
        icon: 'users',
        trend: 'up',
        category: 'engagement',
        description: 'Significant increase in user interaction with AR features'
      },
      {
        label: 'Color Match Accuracy',
        value: '94%',
        improvement: '+34%',
        icon: 'target',
        trend: 'up',
        category: 'technical',
        description: 'AI-powered color matching precision improvement'
      },
      {
        label: 'Session Duration',
        value: '8.5min',
        improvement: '+180%',
        icon: 'clock',
        trend: 'up',
        category: 'engagement',
        description: 'Users spending significantly more time exploring products'
      },
      {
        label: 'Conversion Rate',
        value: '23%',
        improvement: '+156%',
        icon: 'trending-up',
        trend: 'up',
        category: 'business',
        description: 'Direct impact on purchase decisions and sales'
      }
    ],
    technologies: [
      'TensorFlow.js',
      'WebGL',
      'Computer Vision',
      'AR.js',
      'Three.js',
      'Machine Learning',
      'Color Science',
      'WebRTC'
    ],
    timeline: '6 months',
    featured: true,
    status: 'completed',
    dateCompleted: '2024-03-15',
    dateStarted: '2023-09-15',
    tags: ['AR', 'Beauty Tech', 'Gaming', 'Color Matching', 'WebGL'],
    interactive: {
      type: 'demo',
      url: '/demos/maybelline-chromaverse',
      previewImage: '/projects/maybelline-preview.jpg',
      features: [
        'Real-time AR color matching',
        'Interactive gaming elements',
        'Personalized recommendations',
        'Social sharing capabilities'
      ]
    },
    challenges: [
      'Achieving accurate color matching across different lighting conditions',
      'Optimizing AR performance for mobile devices',
      'Integrating gaming mechanics with beauty exploration',
      'Ensuring cross-platform compatibility'
    ],
    outcomes: [
      'Increased user engagement by 240%',
      'Improved color matching accuracy to 94%',
      'Extended average session duration to 8.5 minutes',
      'Boosted conversion rates by 156%'
    ],
    aiCapabilities: [
      {
        type: 'computer-vision',
        description: 'Real-time facial feature detection and color analysis',
        accuracy: 94,
        modelType: 'Convolutional Neural Network',
        trainingData: '50K+ diverse facial images with color annotations',
        processingTime: 'Sub-100ms per frame',
        dataVolume: '2TB training dataset',
        confidence: 96,
        features: ['Face detection', 'Color matching', 'Skin tone analysis', 'Feature tracking']
      },
      {
        type: 'machine-learning',
        description: 'Personalized product recommendation engine',
        accuracy: 87,
        modelType: 'Collaborative Filtering + Deep Learning',
        trainingData: 'User behavior data and product preferences',
        processingTime: '50ms per recommendation',
        dataVolume: '500GB user interaction data',
        confidence: 89,
        features: ['Behavioral analysis', 'Preference learning', 'Real-time recommendations', 'A/B testing']
      }
    ],
    businessImpact: {
      roi: '320%',
      userGrowth: '+240%',
      revenueIncrease: '+156%',
      productivityGain: '+180%',
      customerSatisfaction: '92%'
    },
    technicalDetails: {
      architecture: 'Progressive Web App with WebGL rendering',
      deployment: 'CDN-distributed with edge computing',
      scalability: 'Auto-scaling infrastructure supporting 100K+ concurrent users',
      performance: 'Sub-100ms AR processing latency',
      dataProcessing: 'Real-time image processing pipeline',
      security: 'End-to-end encryption with biometric data protection',
      monitoring: 'Real-time performance analytics and error tracking',
      apiEndpoints: ['/api/face-detection', '/api/color-match', '/api/recommendations'],
      databases: ['MongoDB', 'Redis Cache', 'PostgreSQL'],
      cloudServices: ['AWS Lambda', 'CloudFront CDN', 'S3 Storage']
    },
    testimonial: {
      quote: 'The ChromaVerse project revolutionized how our customers interact with our products. The AI-powered color matching is incredibly accurate and the gaming elements keep users engaged for much longer.',
      author: 'Sarah Chen',
      role: 'Digital Innovation Director',
      company: 'Maybelline',
      avatar: '/testimonials/sarah-chen.jpg'
    }
  },
  {
    id: 'ai-content-optimization',
    title: 'Creative Intelligence Platform',
    client: 'Leading Creative Agencies',
    category: 'ai',
    description: 'An intelligent creative platform that empowers agencies to craft more impactful campaigns. By analyzing audience behavior, creative trends, and performance data, it provides actionable insights that elevate creative work and maximize engagement.',
    shortDescription: 'AI-powered creative intelligence for campaign optimization',
    media: {
      hero: '/projects/ai-content-hero.jpg',
      gallery: [
        '/projects/ai-content-1.jpg',
        '/projects/ai-content-2.jpg'
      ]
    },
    metrics: [
      {
        label: 'Content Performance',
        value: '185%',
        improvement: '+85%',
        icon: 'bar-chart',
        trend: 'up',
        category: 'performance',
        description: 'Overall content engagement and effectiveness improvement'
      },
      {
        label: 'Time Saved',
        value: '12hrs/week',
        improvement: '75% reduction',
        icon: 'clock',
        trend: 'up',
        category: 'performance',
        description: 'Automated optimization reducing manual content work'
      },
      {
        label: 'Prediction Accuracy',
        value: '87%',
        improvement: '+42%',
        icon: 'target',
        trend: 'up',
        category: 'technical',
        description: 'AI model accuracy in predicting content performance'
      },
      {
        label: 'ROI Improvement',
        value: '230%',
        improvement: '+130%',
        icon: 'dollar-sign',
        trend: 'up',
        category: 'business',
        description: 'Return on investment from optimized content strategy'
      }
    ],
    technologies: [
      'Python',
      'Scikit-learn',
      'Natural Language Processing',
      'TensorFlow',
      'Data Analytics',
      'API Integration',
      'Machine Learning',
      'Predictive Modeling'
    ],
    timeline: '4 months',
    featured: true,
    status: 'completed',
    dateCompleted: '2024-01-20',
    dateStarted: '2023-09-20',
    tags: ['NLP', 'Content Strategy', 'Predictive Analytics', 'Automation', 'Performance'],
    interactive: {
      type: 'visualization',
      url: '/demos/content-optimization',
      previewImage: '/projects/ai-content-preview.jpg',
      data: {
        chartType: 'performance-comparison',
        datasets: ['before', 'after', 'predicted']
      },
      features: [
        'Real-time performance analytics',
        'Predictive engagement scoring',
        'Automated content suggestions',
        'Multi-platform optimization'
      ]
    },
    challenges: [
      'Processing diverse content types and formats',
      'Balancing automation with creative control',
      'Integrating with multiple content management systems',
      'Maintaining prediction accuracy across different industries'
    ],
    outcomes: [
      'Reduced content creation time by 75%',
      'Improved content performance by 85%',
      'Achieved 87% prediction accuracy',
      'Generated 230% ROI improvement'
    ],
    aiCapabilities: [
      {
        type: 'nlp',
        description: 'Advanced text analysis and sentiment detection',
        accuracy: 89,
        modelType: 'Transformer-based Language Model',
        trainingData: '2M+ content pieces with performance metrics',
        processingTime: '200ms per document',
        dataVolume: '1.5TB text corpus',
        confidence: 91,
        features: ['Sentiment analysis', 'Topic modeling', 'Content scoring', 'Language detection']
      },
      {
        type: 'prediction',
        description: 'Engagement rate and performance forecasting',
        accuracy: 87,
        modelType: 'Ensemble Learning (Random Forest + Neural Network)',
        trainingData: 'Historical performance data across 500+ campaigns',
        processingTime: '100ms per prediction',
        dataVolume: '800GB campaign data',
        confidence: 85,
        features: ['Trend analysis', 'Performance forecasting', 'Audience segmentation', 'Content optimization']
      }
    ],
    businessImpact: {
      roi: '230%',
      costSavings: '$120K annually per client',
      timeReduction: '75%',
      productivityGain: '+185%',
      errorReduction: '68%'
    },
    technicalDetails: {
      architecture: 'Microservices with ML pipeline orchestration',
      deployment: 'Kubernetes cluster with auto-scaling',
      scalability: 'Processes 10K+ content pieces daily',
      performance: 'Sub-second content analysis and scoring',
      dataProcessing: 'Distributed ML pipeline with batch and stream processing',
      security: 'OAuth 2.0 with role-based access control',
      monitoring: 'Prometheus metrics with Grafana dashboards',
      apiEndpoints: ['/api/analyze', '/api/predict', '/api/optimize', '/api/reports'],
      databases: ['Elasticsearch', 'PostgreSQL', 'InfluxDB'],
      cloudServices: ['Google Cloud ML', 'BigQuery', 'Cloud Storage']
    },
    testimonial: {
      quote: 'This AI system transformed our content strategy. We now create more effective content in half the time, and the predictive insights help us stay ahead of trends.',
      author: 'Marcus Rodriguez',
      role: 'Head of Content Strategy',
      company: 'Digital Marketing Collective',
      avatar: '/testimonials/marcus-rodriguez.jpg'
    }
  },
  {
    id: 'automated-video-editing',
    title: 'AI Video Editing Pipeline',
    client: 'Production Studios',
    category: 'ai',
    description: 'Built an intelligent video editing system that uses computer vision and machine learning to automatically identify key moments, suggest cuts, and optimize pacing for different content types and audiences.',
    shortDescription: 'Automated video editing using computer vision and ML',
    media: {
      hero: '/projects/video-ai-hero.jpg',
      gallery: [
        '/projects/video-ai-1.jpg',
        '/projects/video-ai-2.jpg',
        '/projects/video-ai-3.jpg'
      ],
      video: '/projects/video-ai-demo.mp4'
    },
    metrics: [
      {
        label: 'Editing Time Reduction',
        value: '70%',
        improvement: '70% faster',
        icon: 'zap',
        trend: 'up',
        category: 'performance',
        description: 'Automated editing pipeline significantly reducing manual work'
      },
      {
        label: 'Accuracy Rate',
        value: '91%',
        improvement: '+41%',
        icon: 'check-circle',
        trend: 'up',
        category: 'technical',
        description: 'AI precision in identifying optimal cut points and pacing'
      },
      {
        label: 'Cost Savings',
        value: '$50K/month',
        improvement: '60% reduction',
        icon: 'dollar-sign',
        trend: 'up',
        category: 'business',
        description: 'Reduced labor costs through intelligent automation'
      },
      {
        label: 'Projects Processed',
        value: '500+',
        improvement: '5x increase',
        icon: 'film',
        trend: 'up',
        category: 'performance',
        description: 'Dramatic increase in project throughput capacity'
      }
    ],
    technologies: [
      'OpenCV',
      'FFmpeg',
      'PyTorch',
      'Computer Vision',
      'Audio Processing',
      'Cloud Computing',
      'Docker',
      'REST APIs'
    ],
    timeline: '8 months',
    featured: false,
    status: 'completed',
    dateCompleted: '2023-11-30',
    dateStarted: '2023-03-30',
    tags: ['Video Processing', 'Automation', 'Computer Vision', 'ML Pipeline', 'Production'],
    interactive: {
      type: 'comparison',
      url: '/demos/video-editing-comparison',
      previewImage: '/projects/video-ai-preview.jpg',
      data: {
        beforeAfter: true,
        metrics: ['time', 'quality', 'cost']
      },
      features: [
        'Automated scene detection',
        'Intelligent cut suggestions',
        'Pacing optimization',
        'Multi-format support'
      ]
    },
    challenges: [
      'Processing diverse video formats and qualities',
      'Maintaining creative intent while automating decisions',
      'Handling large-scale video processing efficiently',
      'Balancing speed with accuracy in real-time processing'
    ],
    outcomes: [
      'Reduced editing time by 70%',
      'Achieved 91% accuracy in cut detection',
      'Saved $50K monthly in production costs',
      'Increased project throughput by 5x'
    ],
    aiCapabilities: [
      {
        type: 'computer-vision',
        description: 'Scene detection and visual content analysis',
        accuracy: 91,
        modelType: 'Convolutional Neural Network + LSTM',
        trainingData: '10K+ hours of professionally edited video content',
        processingTime: '2x real-time processing speed',
        dataVolume: '50TB video training data',
        confidence: 93,
        features: ['Scene detection', 'Object recognition', 'Motion analysis', 'Quality assessment']
      },
      {
        type: 'automation',
        description: 'Intelligent editing workflow orchestration',
        accuracy: 88,
        modelType: 'Rule-based system with ML optimization',
        trainingData: 'Editor decision patterns from 1000+ projects',
        processingTime: '5x faster than manual editing',
        dataVolume: '200GB workflow data',
        confidence: 86,
        features: ['Cut detection', 'Pacing optimization', 'Transition selection', 'Audio sync']
      }
    ],
    businessImpact: {
      roi: '280%',
      costSavings: '$600K annually',
      timeReduction: '70%',
      productivityGain: '+400%',
      errorReduction: '45%'
    },
    technicalDetails: {
      architecture: 'Distributed processing pipeline with GPU acceleration',
      deployment: 'Hybrid cloud with on-premise rendering farms',
      scalability: 'Processes 100+ hours of video daily',
      performance: '5x faster than traditional editing workflows',
      dataProcessing: 'GPU-accelerated video processing with CUDA',
      security: 'Content encryption with watermarking',
      monitoring: 'Real-time processing metrics and quality control',
      apiEndpoints: ['/api/upload', '/api/process', '/api/render', '/api/export'],
      databases: ['MongoDB GridFS', 'Redis Queue', 'TimescaleDB'],
      cloudServices: ['AWS EC2 GPU', 'S3 Storage', 'MediaConvert']
    },
    testimonial: {
      quote: 'This AI system has transformed our post-production workflow. We can now handle 5x more projects with the same team, and the quality remains consistently high.',
      author: 'David Kim',
      role: 'Head of Post-Production',
      company: 'Apex Studios',
      avatar: '/testimonials/david-kim.jpg'
    }
  }
];

// Enhanced utility functions using content management system
export const getAIProjects = async () => {
  await ContentDataLoader.initialize();
  const result = getProjects({ category: 'ai' });
  return result.items;
};

export const getFeaturedAIProjects = async () => {
  await ContentDataLoader.initialize();
  const result = getProjects({ category: 'ai', featured: true });
  return result.items;
};

export const getAIProjectById = async (id: string) => {
  await ContentDataLoader.initialize();
  return contentManager.get(id);
};

// Legacy synchronous functions for backward compatibility
export const getAIProjectsSync = () => aiProjects;
export const getFeaturedAIProjectsSync = () => aiProjects.filter(project => project.featured);
export const getAIProjectByIdSync = (id: string) => aiProjects.find(project => project.id === id);

// Enhanced utility functions using content management system
export const getAIProjectsByCapability = async (capabilityType: string) => {
  await ContentDataLoader.initialize();
  const projects = await getAIProjects();
  return projects.filter((project: any) => 
    project.aiCapabilities?.some((capability: any) => capability.type === capabilityType)
  );
};

export const getAIProjectsByTechnology = async (technology: string) => {
  await ContentDataLoader.initialize();
  const projects = await getAIProjects();
  return projects.filter((project: any) =>
    project.technologies.some((tech: string) => 
      tech.toLowerCase().includes(technology.toLowerCase())
    )
  );
};

export const getAIProjectStats = async () => {
  await ContentDataLoader.initialize();
  const projects = await getAIProjects();
  
  const totalProjects = projects.length;
  const featuredProjects = projects.filter((p: any) => p.featured).length;
  const totalTechnologies = new Set(projects.flatMap((p: any) => p.technologies)).size;
  const totalCapabilities = new Set(
    projects.flatMap((p: any) => p.aiCapabilities?.map((c: any) => c.type) || [])
  ).size;
  
  const avgAccuracy = projects
    .flatMap((p: any) => p.aiCapabilities || [])
    .filter((c: any) => c.accuracy)
    .reduce((sum: number, c: any, _index: number, arr: any[]) => sum + (c.accuracy || 0) / arr.length, 0);

  return {
    totalProjects,
    featuredProjects,
    totalTechnologies,
    totalCapabilities,
    avgAccuracy: Math.round(avgAccuracy)
  };
};

// Legacy synchronous functions for backward compatibility
export const getAIProjectsByCapabilitySync = (capabilityType: string) => 
  aiProjects.filter(project => 
    project.aiCapabilities?.some(capability => capability.type === capabilityType)
  );

export const getAIProjectsByTechnologySync = (technology: string) =>
  aiProjects.filter(project =>
    project.technologies.some(tech => 
      tech.toLowerCase().includes(technology.toLowerCase())
    )
  );

export const getAIProjectStatsSync = () => {
  const totalProjects = aiProjects.length;
  const featuredProjects = aiProjects.filter(p => p.featured).length;
  const totalTechnologies = new Set(aiProjects.flatMap(p => p.technologies)).size;
  const totalCapabilities = new Set(
    aiProjects.flatMap(p => p.aiCapabilities?.map(c => c.type) || [])
  ).size;
  
  const avgAccuracy = aiProjects
    .flatMap(p => p.aiCapabilities || [])
    .filter(c => c.accuracy)
    .reduce((sum, c, _, arr) => sum + (c.accuracy || 0) / arr.length, 0);

  return {
    totalProjects,
    featuredProjects,
    totalTechnologies,
    totalCapabilities,
    avgAccuracy: Math.round(avgAccuracy)
  };
};

// Export categories and technologies for filtering
export const aiProjectCategories = ['all', 'ai', 'digital', 'production'];
export const aiProjectTechnologies = Array.from(
  new Set(aiProjects.flatMap(project => project.technologies))
).sort();
export const aiCapabilityTypes = Array.from(
  new Set(aiProjects.flatMap(project => 
    project.aiCapabilities?.map(c => c.type) || []
  ))
);

