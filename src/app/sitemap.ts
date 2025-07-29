import { MetadataRoute } from 'next';
import { getAIProjects } from '@/content/ai-projects';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christopherbelgrave.com';
  
  // Get all AI projects for dynamic routes
  const projects = await getAIProjects();
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cv`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/showreel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/projects-demo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic project routes
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project: any) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(project.dateCompleted || project.dateStarted),
    changeFrequency: 'monthly' as const,
    priority: project.featured ? 0.9 : 0.7,
  }));

  // Category and filter routes
  const categoryRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects/ai`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects/digital`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/projects/production`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  return [...staticRoutes, ...projectRoutes, ...categoryRoutes];
}