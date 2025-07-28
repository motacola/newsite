import { 
  Experience, 
  ExperienceFilter, 
  ExperienceSortOptions, 
  ExperienceStats,
  CVSyncOptions,
  CVSyncResult,
  ValidationResult
} from './types';
import {
  sortExperiences,
  filterExperiences,
  searchExperiences,
  calculateExperienceStats,
  generateCVData,
  getExperiencesBySkill,
  generateCareerProgression,
  exportExperiences
} from './experienceUtils';
import { validateExperiences, sanitizeExperience } from './experienceValidation';

/**
 * Experience Data Manager
 * Central class for managing experience data with validation, filtering, and synchronization
 */
export class ExperienceManager {
  private experiences: Experience[] = [];
  private lastSyncDate: string | null = null;

  constructor(initialExperiences: Experience[] = []) {
    this.setExperiences(initialExperiences);
  }

  /**
   * Set experiences with validation
   */
  setExperiences(experiences: Experience[]): ValidationResult<Experience[]> {
    const validationResult = validateExperiences(experiences);
    
    if (validationResult.isValid && validationResult.data) {
      this.experiences = validationResult.data.map(sanitizeExperience);
    }
    
    return validationResult;
  }

  /**
   * Get all experiences
   */
  getExperiences(): Experience[] {
    return [...this.experiences];
  }

  /**
   * Get experience by ID
   */
  getExperienceById(id: string): Experience | undefined {
    return this.experiences.find(exp => exp.id === id);
  }

  /**
   * Add new experience
   */
  addExperience(experience: Experience): ValidationResult<Experience> {
    const validationResult = validateExperiences([experience]);
    
    if (validationResult.isValid && validationResult.data) {
      const sanitizedExperience = sanitizeExperience(validationResult.data[0]);
      
      // Check for duplicate ID
      if (this.experiences.some(exp => exp.id === sanitizedExperience.id)) {
        return {
          isValid: false,
          errors: [{
            field: 'id',
            message: `Experience with ID '${sanitizedExperience.id}' already exists`,
            code: 'DUPLICATE_ID'
          }]
        };
      }
      
      this.experiences.push(sanitizedExperience);
      return {
        isValid: true,
        data: sanitizedExperience,
        errors: []
      };
    }
    
    return {
      isValid: false,
      errors: validationResult.errors
    };
  }

  /**
   * Update existing experience
   */
  updateExperience(id: string, updates: Partial<Experience>): ValidationResult<Experience> {
    const existingIndex = this.experiences.findIndex(exp => exp.id === id);
    
    if (existingIndex === -1) {
      return {
        isValid: false,
        errors: [{
          field: 'id',
          message: `Experience with ID '${id}' not found`,
          code: 'NOT_FOUND'
        }]
      };
    }
    
    const updatedExperience = { ...this.experiences[existingIndex], ...updates };
    const validationResult = validateExperiences([updatedExperience]);
    
    if (validationResult.isValid && validationResult.data) {
      const sanitizedExperience = sanitizeExperience(validationResult.data[0]);
      this.experiences[existingIndex] = sanitizedExperience;
      
      return {
        isValid: true,
        data: sanitizedExperience,
        errors: []
      };
    }
    
    return {
      isValid: false,
      errors: validationResult.errors
    };
  }

  /**
   * Remove experience
   */
  removeExperience(id: string): boolean {
    const initialLength = this.experiences.length;
    this.experiences = this.experiences.filter(exp => exp.id !== id);
    return this.experiences.length < initialLength;
  }

  /**
   * Filter experiences
   */
  filter(filter: ExperienceFilter): Experience[] {
    return filterExperiences(this.experiences, filter);
  }

  /**
   * Sort experiences
   */
  sort(sortOptions: ExperienceSortOptions): Experience[] {
    return sortExperiences(this.experiences, sortOptions);
  }

  /**
   * Search experiences
   */
  search(query: string): Experience[] {
    return searchExperiences(this.experiences, query);
  }

  /**
   * Get experiences by skill with relevance
   */
  getBySkill(skill: string): { experience: Experience; relevance: number }[] {
    return getExperiencesBySkill(this.experiences, skill);
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): ExperienceStats {
    return calculateExperienceStats(this.experiences);
  }

  /**
   * Get career progression insights
   */
  getCareerProgression(): {
    progression: string[];
    skillEvolution: Record<string, string[]>;
    careerPath: string;
  } {
    return generateCareerProgression(this.experiences);
  }

  /**
   * Generate CV data with synchronization
   */
  generateCV(pdfUrl: string, options: CVSyncOptions = {}): CVSyncResult {
    const result = generateCVData(this.experiences, pdfUrl, options);
    
    if (result.success) {
      this.lastSyncDate = result.lastSyncDate;
    }
    
    return result;
  }

  /**
   * Export experiences to different formats
   */
  export(format: 'json' | 'csv' | 'xml'): string {
    return exportExperiences(this.experiences, format);
  }

  /**
   * Get last sync date
   */
  getLastSyncDate(): string | null {
    return this.lastSyncDate;
  }

  /**
   * Bulk operations
   */
  bulkUpdate(updates: { id: string; updates: Partial<Experience> }[]): {
    successful: Experience[];
    failed: { id: string; errors: any[] }[];
  } {
    const successful: Experience[] = [];
    const failed: { id: string; errors: any[] }[] = [];

    updates.forEach(({ id, updates: experienceUpdates }) => {
      const result = this.updateExperience(id, experienceUpdates);
      
      if (result.isValid && result.data) {
        successful.push(result.data);
      } else {
        failed.push({ id, errors: result.errors });
      }
    });

    return { successful, failed };
  }

  /**
   * Get featured experiences
   */
  getFeatured(): Experience[] {
    return this.experiences.filter(exp => exp.featured);
  }

  /**
   * Get recent experiences (within specified months)
   */
  getRecent(months: number = 24): Experience[] {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    return this.experiences.filter(exp => {
      const endDate = exp.duration.end === 'Present' ? new Date() : new Date(exp.duration.end);
      return endDate >= cutoffDate;
    });
  }

  /**
   * Get experiences by company
   */
  getByCompany(company: string): Experience[] {
    return this.experiences.filter(exp => 
      exp.company.toLowerCase().includes(company.toLowerCase())
    );
  }

  /**
   * Get unique companies
   */
  getUniqueCompanies(): string[] {
    return [...new Set(this.experiences.map(exp => exp.company))].sort();
  }

  /**
   * Get unique skills across all experiences
   */
  getUniqueSkills(): string[] {
    const skillsSet = new Set<string>();
    this.experiences.forEach(exp => {
      exp.skills.forEach(skill => skillsSet.add(skill));
      if (exp.technologies) {
        exp.technologies.forEach(tech => skillsSet.add(tech));
      }
    });
    return Array.from(skillsSet).sort();
  }

  /**
   * Get experiences within date range
   */
  getByDateRange(startDate: string, endDate: string): Experience[] {
    return this.filter({
      dateRange: { start: startDate, end: endDate }
    });
  }

  /**
   * Clone the manager with filtered data
   */
  clone(filter?: ExperienceFilter): ExperienceManager {
    const experiences = filter ? this.filter(filter) : this.experiences;
    return new ExperienceManager(experiences);
  }

  /**
   * Reset to original state
   */
  reset(): void {
    this.experiences = [];
    this.lastSyncDate = null;
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalExperiences: number;
    totalYears: number;
    currentRole: Experience | null;
    topSkills: string[];
    companiesCount: number;
  } {
    const stats = this.getStats();
    const sortedByDate = this.sort({ field: 'endDate', direction: 'desc' });
    const currentRole = sortedByDate.find(exp => exp.duration.end === 'Present') || null;
    
    const topSkills = Object.entries(stats.skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);

    return {
      totalExperiences: stats.totalExperiences,
      totalYears: stats.totalYears,
      currentRole,
      topSkills,
      companiesCount: stats.companiesWorkedAt
    };
  }
}

// Create and export a default instance
export const experienceManager = new ExperienceManager();

// Export utility functions for direct use
export {
  sortExperiences,
  filterExperiences,
  searchExperiences,
  calculateExperienceStats,
  generateCVData,
  getExperiencesBySkill,
  generateCareerProgression,
  exportExperiences
} from './experienceUtils';

export {
  validateExperiences,
  validateExperience,
  sanitizeExperience
} from './experienceValidation';