import { ExperienceManager } from '../experienceManager';
import { Experience, ExperienceFilter, ExperienceSortOptions } from '../types';

// Mock experience data for testing
const mockExperiences: Experience[] = [
  {
    id: 'exp-1',
    title: 'Senior AI Project Manager',
    company: 'Ogilvy',
    duration: { start: 'Jan 2022', end: 'Present' },
    description: 'Leading AI-driven advertising campaigns',
    achievements: ['Delivered ChromaVerse AR experience'],
    skills: ['AI Project Management', 'Machine Learning', 'Leadership'],
    projects: ['project-1'],
    featured: true,
    type: 'full-time',
    companySize: 'large',
    industry: 'Advertising',
    location: 'London, UK',
    technologies: ['React', 'Python', 'TensorFlow'],
    teamSize: 12,
    isRemote: false,
    tags: ['AI', 'Leadership']
  },
  {
    id: 'exp-2',
    title: 'Digital Project Manager',
    company: 'Wunderman Thompson',
    duration: { start: 'Mar 2019', end: 'Dec 2021' },
    description: 'Managed digital marketing campaigns',
    achievements: ['Delivered award-winning website redesign'],
    skills: ['Digital Project Management', 'Web Development'],
    projects: ['project-2'],
    featured: true,
    type: 'full-time',
    companySize: 'large',
    industry: 'Digital Marketing',
    location: 'London, UK',
    technologies: ['JavaScript', 'React'],
    teamSize: 8,
    isRemote: false,
    tags: ['Digital Marketing', 'Web Development']
  }
];

describe('ExperienceManager', () => {
  let manager: ExperienceManager;

  beforeEach(() => {
    manager = new ExperienceManager(mockExperiences);
  });

  describe('Basic Operations', () => {
    test('should initialize with experiences', () => {
      expect(manager.getExperiences()).toHaveLength(2);
    });

    test('should get experience by ID', () => {
      const experience = manager.getExperienceById('exp-1');
      expect(experience?.title).toBe('Senior AI Project Manager');
    });

    test('should return undefined for non-existent ID', () => {
      const experience = manager.getExperienceById('non-existent');
      expect(experience).toBeUndefined();
    });

    test('should add new experience', () => {
      const newExperience: Experience = {
        id: 'exp-3',
        title: 'Junior Developer',
        company: 'Tech Corp',
        duration: { start: 'Jan 2018', end: 'Feb 2019' },
        description: 'Developed web applications',
        achievements: ['Built responsive websites'],
        skills: ['JavaScript', 'HTML', 'CSS'],
        projects: [],
        featured: false
      };

      const result = manager.addExperience(newExperience);
      expect(result.isValid).toBe(true);
      expect(manager.getExperiences()).toHaveLength(3);
    });

    test('should prevent duplicate IDs', () => {
      const duplicateExperience: Experience = {
        ...mockExperiences[0],
        title: 'Different Title'
      };

      const result = manager.addExperience(duplicateExperience);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('DUPLICATE_ID');
    });

    test('should update existing experience', () => {
      const result = manager.updateExperience('exp-1', { title: 'Updated Title' });
      expect(result.isValid).toBe(true);
      expect(result.data?.title).toBe('Updated Title');
    });

    test('should remove experience', () => {
      const removed = manager.removeExperience('exp-1');
      expect(removed).toBe(true);
      expect(manager.getExperiences()).toHaveLength(1);
    });
  });

  describe('Filtering', () => {
    test('should filter by company', () => {
      const filter: ExperienceFilter = { company: 'Ogilvy' };
      const filtered = manager.filter(filter);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].company).toBe('Ogilvy');
    });

    test('should filter by skills', () => {
      const filter: ExperienceFilter = { skills: ['Machine Learning'] };
      const filtered = manager.filter(filter);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].skills).toContain('Machine Learning');
    });

    test('should filter by featured status', () => {
      const filter: ExperienceFilter = { featured: true };
      const filtered = manager.filter(filter);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(exp => exp.featured)).toBe(true);
    });

    test('should filter by type', () => {
      const filter: ExperienceFilter = { type: 'full-time' };
      const filtered = manager.filter(filter);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Sorting', () => {
    test('should sort by company name ascending', () => {
      const sortOptions: ExperienceSortOptions = { field: 'company', direction: 'asc' };
      const sorted = manager.sort(sortOptions);
      expect(sorted[0].company).toBe('Ogilvy');
      expect(sorted[1].company).toBe('Wunderman Thompson');
    });

    test('should sort by end date descending', () => {
      const sortOptions: ExperienceSortOptions = { field: 'endDate', direction: 'desc' };
      const sorted = manager.sort(sortOptions);
      expect(sorted[0].duration.end).toBe('Present');
    });
  });

  describe('Search', () => {
    test('should search by title', () => {
      const results = manager.search('AI');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('AI');
    });

    test('should search by company', () => {
      const results = manager.search('Ogilvy');
      expect(results).toHaveLength(1);
      expect(results[0].company).toBe('Ogilvy');
    });

    test('should search by skills', () => {
      const results = manager.search('Machine Learning');
      expect(results).toHaveLength(1);
    });

    test('should return all experiences for empty query', () => {
      const results = manager.search('');
      expect(results).toHaveLength(2);
    });
  });

  describe('Statistics', () => {
    test('should calculate basic stats', () => {
      const stats = manager.getStats();
      expect(stats.totalExperiences).toBe(2);
      expect(stats.companiesWorkedAt).toBe(2);
      expect(stats.featuredExperiences).toBe(2);
      expect(stats.uniqueSkills).toBeGreaterThan(0);
    });

    test('should get summary', () => {
      const summary = manager.getSummary();
      expect(summary.totalExperiences).toBe(2);
      expect(summary.companiesCount).toBe(2);
      expect(summary.currentRole?.duration.end).toBe('Present');
      expect(summary.topSkills.length).toBeGreaterThan(0);
    });
  });

  describe('Skill-based Operations', () => {
    test('should get experiences by skill with relevance', () => {
      const results = manager.getBySkill('Machine Learning');
      expect(results).toHaveLength(1);
      expect(results[0].relevance).toBeGreaterThan(0);
    });

    test('should get unique skills', () => {
      const skills = manager.getUniqueSkills();
      expect(skills).toContain('Machine Learning');
      expect(skills).toContain('Digital Project Management');
    });
  });

  describe('Company Operations', () => {
    test('should get experiences by company', () => {
      const experiences = manager.getByCompany('Ogilvy');
      expect(experiences).toHaveLength(1);
      expect(experiences[0].company).toBe('Ogilvy');
    });

    test('should get unique companies', () => {
      const companies = manager.getUniqueCompanies();
      expect(companies).toContain('Ogilvy');
      expect(companies).toContain('Wunderman Thompson');
      expect(companies).toHaveLength(2);
    });
  });

  describe('CV Generation', () => {
    test('should generate CV data', () => {
      const result = manager.generateCV('/path/to/cv.pdf');
      expect(result.success).toBe(true);
      expect(result.cvData.sections.experiences).toHaveLength(2);
      expect(result.cvData.sections.skills.length).toBeGreaterThan(0);
    });

    test('should generate CV with options', () => {
      const options = { maxExperiences: 1, includeAllExperiences: false };
      const result = manager.generateCV('/path/to/cv.pdf', options);
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Career Progression', () => {
    test('should generate career progression', () => {
      const progression = manager.getCareerProgression();
      expect(progression.progression).toHaveLength(2);
      expect(progression.skillEvolution).toBeDefined();
      expect(progression.careerPath).toContain('→');
    });
  });

  describe('Export', () => {
    test('should export to JSON', () => {
      const json = manager.export('json');
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(2);
    });

    test('should export to CSV', () => {
      const csv = manager.export('csv');
      expect(csv).toContain('ID,Title,Company');
      expect(csv.split('\n')).toHaveLength(3); // Header + 2 data rows
    });

    test('should export to XML', () => {
      const xml = manager.export('xml');
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<experiences>');
      expect(xml).toContain('<experience id="exp-1">');
    });
  });

  describe('Bulk Operations', () => {
    test('should perform bulk updates', () => {
      const updates = [
        { id: 'exp-1', updates: { title: 'Updated Title 1' } },
        { id: 'exp-2', updates: { title: 'Updated Title 2' } }
      ];

      const result = manager.bulkUpdate(updates);
      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
    });

    test('should handle bulk update failures', () => {
      const updates = [
        { id: 'exp-1', updates: { title: 'Valid Update' } },
        { id: 'non-existent', updates: { title: 'Invalid Update' } }
      ];

      const result = manager.bulkUpdate(updates);
      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });
  });

  describe('Utility Methods', () => {
    test('should get featured experiences', () => {
      const featured = manager.getFeatured();
      expect(featured).toHaveLength(2);
      expect(featured.every(exp => exp.featured)).toBe(true);
    });

    test('should clone manager', () => {
      const cloned = manager.clone();
      expect(cloned.getExperiences()).toHaveLength(2);
      
      // Verify it's a separate instance
      cloned.removeExperience('exp-1');
      expect(cloned.getExperiences()).toHaveLength(1);
      expect(manager.getExperiences()).toHaveLength(2);
    });

    test('should clone with filter', () => {
      const filter: ExperienceFilter = { company: 'Ogilvy' };
      const cloned = manager.clone(filter);
      expect(cloned.getExperiences()).toHaveLength(1);
    });

    test('should reset manager', () => {
      manager.reset();
      expect(manager.getExperiences()).toHaveLength(0);
      expect(manager.getLastSyncDate()).toBeNull();
    });
  });
});