// Data loader for initializing content management system

import { contentManager } from './manager';
import { ManagedProject, ManagedExperience, ManagedSkill } from './types';

// Import JSON data
import projectsData from '../../content/managed-projects.json';
import experiencesData from '../../content/managed-experiences.json';
import skillsData from '../../content/managed-skills.json';

export class ContentDataLoader {
  private static initialized = false;
  private static loading = false;

  /**
   * Initialize content management system with data
   */
  static async initialize(): Promise<{
    success: boolean;
    loaded: {
      projects: number;
      experiences: number;
      skills: number;
    };
    errors: string[];
  }> {
    if (this.initialized) {
      return {
        success: true,
        loaded: this.getLoadedCounts(),
        errors: []
      };
    }

    if (this.loading) {
      // Wait for existing initialization to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return {
        success: this.initialized,
        loaded: this.getLoadedCounts(),
        errors: []
      };
    }

    this.loading = true;
    const errors: string[] = [];
    const loaded = { projects: 0, experiences: 0, skills: 0 };

    try {
      // Load projects
      const projectResults = await this.loadProjects();
      loaded.projects = projectResults.loaded;
      errors.push(...projectResults.errors);

      // Load experiences
      const experienceResults = await this.loadExperiences();
      loaded.experiences = experienceResults.loaded;
      errors.push(...experienceResults.errors);

      // Load skills
      const skillResults = await this.loadSkills();
      loaded.skills = skillResults.loaded;
      errors.push(...skillResults.errors);

      this.initialized = true;
      console.log('Content management system initialized successfully', {
        loaded,
        errors: errors.length
      });

    } catch (error) {
      errors.push(`Failed to initialize content system: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.loading = false;
    }

    return {
      success: this.initialized,
      loaded,
      errors
    };
  }

  /**
   * Load projects into content manager
   */
  private static async loadProjects(): Promise<{ loaded: number; errors: string[] }> {
    const errors: string[] = [];
    let loaded = 0;

    try {
      const projects = projectsData.projects as ManagedProject[];
      
      for (const project of projects) {
        const result = await contentManager.create(project, 'system');
        if (result.success) {
          loaded++;
        } else {
          errors.push(`Failed to load project ${project.id}: ${result.errors?.join(', ')}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to load projects data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { loaded, errors };
  }

  /**
   * Load experiences into content manager
   */
  private static async loadExperiences(): Promise<{ loaded: number; errors: string[] }> {
    const errors: string[] = [];
    let loaded = 0;

    try {
      const experiences = experiencesData.experiences as ManagedExperience[];
      
      for (const experience of experiences) {
        const result = await contentManager.create(experience, 'system');
        if (result.success) {
          loaded++;
        } else {
          errors.push(`Failed to load experience ${experience.id}: ${result.errors?.join(', ')}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to load experiences data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { loaded, errors };
  }

  /**
   * Load skills into content manager
   */
  private static async loadSkills(): Promise<{ loaded: number; errors: string[] }> {
    const errors: string[] = [];
    let loaded = 0;

    try {
      const skills = skillsData.skills as ManagedSkill[];
      
      for (const skill of skills) {
        const result = await contentManager.create(skill, 'system');
        if (result.success) {
          loaded++;
        } else {
          errors.push(`Failed to load skill ${skill.id}: ${result.errors?.join(', ')}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to load skills data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { loaded, errors };
  }

  /**
   * Get current loaded content counts
   */
  private static getLoadedCounts(): { projects: number; experiences: number; skills: number } {
    const stats = contentManager.getStats();
    return {
      projects: stats.byType.project || 0,
      experiences: stats.byType.experience || 0,
      skills: stats.byType.skill || 0
    };
  }

  /**
   * Reload all content (useful for development)
   */
  static async reload(): Promise<{
    success: boolean;
    loaded: {
      projects: number;
      experiences: number;
      skills: number;
    };
    errors: string[];
  }> {
    // Clear existing content
    contentManager.clear();
    this.initialized = false;
    
    // Reinitialize
    return this.initialize();
  }

  /**
   * Get initialization status
   */
  static getStatus(): {
    initialized: boolean;
    loading: boolean;
    stats: ReturnType<typeof contentManager.getStats>;
  } {
    return {
      initialized: this.initialized,
      loading: this.loading,
      stats: this.initialized ? contentManager.getStats() : {
        total: 0,
        byType: {},
        byStatus: {},
        featured: 0,
        recentlyUpdated: 0
      }
    };
  }

  /**
   * Validate all loaded content
   */
  static async validateContent(): Promise<{
    valid: number;
    invalid: number;
    errors: Array<{
      contentId: string;
      contentType: string;
      errors: string[];
    }>;
  }> {
    const allContent = contentManager.export().content;
    let valid = 0;
    let invalid = 0;
    const errors: Array<{
      contentId: string;
      contentType: string;
      errors: string[];
    }> = [];

    for (const content of allContent) {
      // Re-validate each content item
      const result = await contentManager.update(content.id, {}, 'system', {
        validateBeforeUpdate: true,
        updateVersion: false
      });

      if (result.success) {
        valid++;
      } else {
        invalid++;
        errors.push({
          contentId: content.id,
          contentType: content.type,
          errors: result.errors || []
        });
      }
    }

    return { valid, invalid, errors };
  }

  /**
   * Export all content for backup
   */
  static exportContent(): {
    projects: ManagedProject[];
    experiences: ManagedExperience[];
    skills: ManagedSkill[];
    exportedAt: string;
    version: string;
  } {
    const projects = contentManager.getByType<ManagedProject>('project');
    const experiences = contentManager.getByType<ManagedExperience>('experience');
    const skills = contentManager.getByType<ManagedSkill>('skill');

    return {
      projects,
      experiences,
      skills,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Import content from backup
   */
  static async importContent(data: {
    projects?: ManagedProject[];
    experiences?: ManagedExperience[];
    skills?: ManagedSkill[];
  }): Promise<{
    success: boolean;
    imported: {
      projects: number;
      experiences: number;
      skills: number;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const imported = { projects: 0, experiences: 0, skills: 0 };

    try {
      // Import projects
      if (data.projects) {
        const result = await contentManager.bulkImport(data.projects, 'import');
        imported.projects = result.imported;
        errors.push(...result.errors);
      }

      // Import experiences
      if (data.experiences) {
        const result = await contentManager.bulkImport(data.experiences, 'import');
        imported.experiences = result.imported;
        errors.push(...result.errors);
      }

      // Import skills
      if (data.skills) {
        const result = await contentManager.bulkImport(data.skills, 'import');
        imported.skills = result.imported;
        errors.push(...result.errors);
      }

    } catch (error) {
      errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      success: errors.length === 0,
      imported,
      errors
    };
  }
}

// Auto-initialize on module load (for development)
if (typeof window !== 'undefined') {
  ContentDataLoader.initialize().catch(console.error);
}

export default ContentDataLoader;