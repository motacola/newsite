import { Experience, ExperienceFilter, ExperienceSortOptions, CVSyncOptions } from '@/lib/types';
import { experienceManager } from '@/lib/experienceManager';

export const experiences: Experience[] = [
  {
    id: 'exp-1',
    title: 'Senior AI Project Manager',
    company: 'Ogilvy',
    duration: {
      start: 'Jan 2022',
      end: 'Present',
    },
    description: 'Leading AI-driven advertising campaigns and digital transformation initiatives for major global brands. Responsible for end-to-end project management of cutting-edge AI implementations in marketing technology.',
    achievements: [
      'Successfully delivered the Maybelline ChromaVerse AR gaming experience, increasing user engagement by 45%',
      'Implemented AI-powered content optimization tools that reduced campaign production time by 30%',
      'Led cross-functional teams of developers, designers, and data scientists to deliver complex AI projects on time and within budget',
      'Pioneered the adoption of machine learning models for customer segmentation and personalized marketing',
    ],
    skills: [
      'AI Project Management',
      'Machine Learning',
      'AR/VR',
      'Digital Marketing',
      'Team Leadership',
      'Agile Methodologies',
      'Client Relations',
    ],
    projects: ['project-1', 'project-2'],
    featured: true,
    type: 'full-time',
    companySize: 'large',
    industry: 'Advertising & Marketing',
    location: 'London, UK',
    technologies: ['React', 'Node.js', 'Python', 'TensorFlow', 'AWS'],
    teamSize: 12,
    directReports: 3,
    isRemote: false,
    tags: ['AI', 'Project Management', 'Leadership', 'Innovation'],
    companyWebsite: 'https://www.ogilvy.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'exp-2',
    title: 'Digital Project Manager',
    company: 'Wunderman Thompson',
    duration: {
      start: 'Mar 2019',
      end: 'Dec 2021',
    },
    description: 'Managed digital marketing campaigns and web development projects for enterprise clients. Specialized in data-driven marketing solutions and interactive web experiences.',
    achievements: [
      'Delivered award-winning website redesign for a Fortune 500 financial services client, improving conversion rates by 25%',
      'Implemented automated reporting dashboards that reduced weekly reporting time by 70%',
      'Managed a portfolio of projects with a combined budget of $1.5M annually',
      'Introduced agile methodologies to the digital project team, improving delivery timelines by 40%',
    ],
    skills: [
      'Digital Project Management',
      'Web Development',
      'Data Analytics',
      'Agile/Scrum',
      'Client Management',
      'Marketing Automation',
    ],
    projects: ['project-3', 'project-4'],
    featured: true,
    type: 'full-time',
    companySize: 'large',
    industry: 'Digital Marketing',
    location: 'London, UK',
    technologies: ['JavaScript', 'React', 'Node.js', 'Google Analytics', 'Adobe Creative Suite'],
    teamSize: 8,
    directReports: 2,
    isRemote: false,
    tags: ['Digital Marketing', 'Web Development', 'Analytics', 'Team Leadership'],
    companyWebsite: 'https://www.wundermanthompson.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'exp-3',
    title: 'Technical Project Coordinator',
    company: 'Publicis Sapient',
    duration: {
      start: 'Jun 2017',
      end: 'Feb 2019',
    },
    description: 'Coordinated technical aspects of digital transformation projects for retail and financial services clients. Worked closely with development teams to ensure technical requirements were met.',
    achievements: [
      'Supported the successful launch of an e-commerce platform that generated $2M in first-quarter revenue',
      'Streamlined project documentation processes, reducing onboarding time for new team members by 50%',
      'Coordinated UAT testing phases across 5 major project releases with zero critical defects',
      'Created technical specification templates that became company standard for all new projects',
    ],
    skills: [
      'Technical Coordination',
      'E-commerce',
      'Requirements Gathering',
      'UAT Testing',
      'Documentation',
      'Stakeholder Management',
    ],
    projects: ['project-5'],
    featured: false,
    type: 'full-time',
    companySize: 'large',
    industry: 'Digital Transformation',
    location: 'London, UK',
    technologies: ['Java', 'Spring', 'MySQL', 'Jenkins', 'JIRA'],
    teamSize: 6,
    directReports: 0,
    isRemote: false,
    tags: ['Technical Coordination', 'E-commerce', 'Testing', 'Documentation'],
    companyWebsite: 'https://www.publicissapient.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'exp-4',
    title: 'Junior Digital Producer',
    company: 'AKQA',
    duration: {
      start: 'Sep 2015',
      end: 'May 2017',
    },
    description: 'Assisted in the production of digital marketing campaigns and interactive experiences for sports and luxury brands. Supported senior producers in day-to-day project management activities.',
    achievements: [
      'Contributed to an award-winning interactive campaign for a major sportswear brand',
      'Managed content updates and maintenance for multiple client websites',
      'Coordinated with creative and development teams to ensure timely delivery of assets',
      'Assisted in client presentations and status reporting',
    ],
    skills: [
      'Digital Production',
      'Content Management',
      'Creative Coordination',
      'Client Communication',
      'Social Media Campaigns',
    ],
    projects: [],
    featured: false,
    type: 'full-time',
    companySize: 'medium',
    industry: 'Digital Agency',
    location: 'London, UK',
    technologies: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'Photoshop'],
    teamSize: 4,
    directReports: 0,
    isRemote: false,
    tags: ['Digital Production', 'Content Management', 'Creative Support'],
    companyWebsite: 'https://www.akqa.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Initialize the experience manager with the data
experienceManager.setExperiences(experiences);

// Export additional utility functions for easy access
export const getExperienceStats = () => experienceManager.getStats();
export const getFeaturedExperiences = () => experienceManager.getFeatured();
export const searchExperiences = (query: string) => experienceManager.search(query);
export const filterExperiences = (filter: ExperienceFilter) => experienceManager.filter(filter);
export const sortExperiences = (sortOptions: ExperienceSortOptions) => experienceManager.sort(sortOptions);
export const generateCV = (pdfUrl: string, options?: CVSyncOptions) => experienceManager.generateCV(pdfUrl, options);
export const getCareerProgression = () => experienceManager.getCareerProgression();
export const getSummary = () => experienceManager.getSummary();

export default experiences;