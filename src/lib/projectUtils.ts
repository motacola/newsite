import { Project } from './types';

// Project filtering and sorting utilities
export class ProjectUtils {
  static filterByCategory(projects: Project[], category: string): Project[] {
    if (category === 'all') return projects;
    return projects.filter(project => project.category === category);
  }

  static filterByTechnology(projects: Project[], technology: string): Project[] {
    return projects.filter(project => 
      project.technologies.some(tech => 
        tech.toLowerCase().includes(technology.toLowerCase())
      )
    );
  }

  static filterByAICapability(projects: Project[], capabilityType: string): Project[] {
    return projects.filter(project => 
      project.aiCapabilities?.some(capability => 
        capability.type === capabilityType
      )
    );
  }

  static searchProjects(projects: Project[], query: string): Project[] {
    const searchTerm = query.toLowerCase();
    return projects.filter(project => 
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.shortDescription.toLowerCase().includes(searchTerm) ||
      project.client.toLowerCase().includes(searchTerm) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm)) ||
      project.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  static sortProjects(projects: Project[], sortBy: 'date' | 'impact' | 'technology' | 'featured'): Project[] {
    const sorted = [...projects];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.dateCompleted || '1970-01-01');
          const dateB = new Date(b.dateCompleted || '1970-01-01');
          return dateB.getTime() - dateA.getTime();
        });
      
      case 'impact':
        return sorted.sort((a, b) => {
          const impactA = this.calculateImpactScore(a);
          const impactB = this.calculateImpactScore(b);
          return impactB - impactA;
        });
      
      case 'technology':
        return sorted.sort((a, b) => b.technologies.length - a.technologies.length);
      
      case 'featured':
        return sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
      
      default:
        return sorted;
    }
  }

  static calculateImpactScore(project: Project): number {
    let score = 0;
    
    // Base score for metrics
    score += project.metrics.length * 10;
    
    // Bonus for high-impact metrics
    project.metrics.forEach(metric => {
      if (metric.improvement) {
        const improvementValue = parseFloat(metric.improvement.replace(/[^\d.]/g, ''));
        if (!isNaN(improvementValue)) {
          score += improvementValue;
        }
      }
    });
    
    // Bonus for AI capabilities
    if (project.aiCapabilities) {
      score += project.aiCapabilities.length * 20;
      project.aiCapabilities.forEach(capability => {
        if (capability.accuracy) {
          score += capability.accuracy;
        }
      });
    }
    
    // Bonus for business impact
    if (project.businessImpact) {
      if (project.businessImpact.roi) {
        const roiValue = parseFloat(project.businessImpact.roi.replace(/[^\d.]/g, ''));
        if (!isNaN(roiValue)) {
          score += roiValue;
        }
      }
    }
    
    // Bonus for featured projects
    if (project.featured) {
      score += 50;
    }
    
    return score;
  }

  static getUniqueCategories(projects: Project[]): string[] {
    const categories = new Set(projects.map(p => p.category));
    return Array.from(categories);
  }

  static getUniqueTechnologies(projects: Project[]): string[] {
    const technologies = new Set<string>();
    projects.forEach(project => {
      project.technologies.forEach(tech => technologies.add(tech));
    });
    return Array.from(technologies).sort();
  }

  static getUniqueAICapabilities(projects: Project[]): string[] {
    const capabilities = new Set<string>();
    projects.forEach(project => {
      project.aiCapabilities?.forEach(capability => {
        capabilities.add(capability.type);
      });
    });
    return Array.from(capabilities);
  }

  static getProjectStats(projects: Project[]) {
    const totalProjects = projects.length;
    const featuredProjects = projects.filter(p => p.featured).length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTechnologies = this.getUniqueTechnologies(projects).length;
    const totalAICapabilities = this.getUniqueAICapabilities(projects).length;
    
    // Calculate average metrics
    const allMetrics = projects.flatMap(p => p.metrics);
    const avgMetricsPerProject = allMetrics.length / totalProjects;
    
    // Calculate total business impact (where available)
    const projectsWithROI = projects.filter(p => p.businessImpact?.roi);
    const avgROI = projectsWithROI.length > 0 
      ? projectsWithROI.reduce((sum, p) => {
          const roi = parseFloat(p.businessImpact!.roi!.replace(/[^\d.]/g, ''));
          return sum + (isNaN(roi) ? 0 : roi);
        }, 0) / projectsWithROI.length
      : 0;

    return {
      totalProjects,
      featuredProjects,
      completedProjects,
      totalTechnologies,
      totalAICapabilities,
      avgMetricsPerProject: Math.round(avgMetricsPerProject * 10) / 10,
      avgROI: Math.round(avgROI)
    };
  }

  static generateProjectSummary(project: Project): string {
    const parts = [];
    
    // Basic info
    parts.push(`${project.title} for ${project.client}`);
    
    // Key metrics
    if (project.metrics.length > 0) {
      const topMetric = project.metrics[0];
      parts.push(`achieving ${topMetric.value} ${topMetric.label.toLowerCase()}`);
    }
    
    // AI capabilities
    if (project.aiCapabilities && project.aiCapabilities.length > 0) {
      const capabilities = project.aiCapabilities.map(c => c.type.replace('-', ' ')).join(', ');
      parts.push(`using ${capabilities}`);
    }
    
    // Timeline
    parts.push(`completed in ${project.timeline}`);
    
    return parts.join(', ') + '.';
  }

  static validateProject(project: Partial<Project>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!project.id) errors.push('Project ID is required');
    if (!project.title) errors.push('Project title is required');
    if (!project.client) errors.push('Client name is required');
    if (!project.category) errors.push('Project category is required');
    if (!project.description) errors.push('Project description is required');
    if (!project.shortDescription) errors.push('Short description is required');
    if (!project.media?.hero) errors.push('Hero image is required');
    if (!project.technologies || project.technologies.length === 0) {
      errors.push('At least one technology is required');
    }
    if (!project.timeline) errors.push('Timeline is required');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static exportProjectData(projects: Project[], format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'ID', 'Title', 'Client', 'Category', 'Timeline', 'Status', 
        'Featured', 'Technologies', 'Metrics Count', 'AI Capabilities'
      ];
      
      const rows = projects.map(project => [
        project.id,
        project.title,
        project.client,
        project.category,
        project.timeline,
        project.status || 'completed',
        project.featured ? 'Yes' : 'No',
        project.technologies.join('; '),
        project.metrics.length.toString(),
        project.aiCapabilities?.map(c => c.type).join('; ') || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(projects, null, 2);
  }
}

// Utility functions for component use
export const getProjectById = (projects: Project[], id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getFeaturedProjects = (projects: Project[]): Project[] => {
  return projects.filter(project => project.featured);
};

export const getRecentProjects = (projects: Project[], limit: number = 3): Project[] => {
  return ProjectUtils.sortProjects(projects, 'date').slice(0, limit);
};

export const getHighImpactProjects = (projects: Project[], limit: number = 3): Project[] => {
  return ProjectUtils.sortProjects(projects, 'impact').slice(0, limit);
};

// Type guards
export const isAIProject = (project: Project): boolean => {
  return project.category === 'ai' || Boolean(project.aiCapabilities && project.aiCapabilities.length > 0);
};

export const hasInteractiveDemo = (project: Project): boolean => {
  return Boolean(project.interactive);
};

export const hasBusinessImpact = (project: Project): boolean => {
  return Boolean(project.businessImpact);
};