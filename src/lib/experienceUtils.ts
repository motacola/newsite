import { 
  Experience, 
  Education, 
  Certification, 
  CVData, 
  ExperienceFilter, 
  ExperienceSortOptions, 
  ExperienceStats,
  CVSyncOptions,
  CVSyncResult
} from './types';
import { validateExperiences, parseExperienceDate, sanitizeExperience } from './experienceValidation';

/**
 * Sort experiences by date (most recent first)
 */
export const sortExperiencesByDate = (experiences: Experience[]): Experience[] => {
  return [...experiences].sort((a, b) => {
    // Handle "Present" as the most recent date
    const endA = a.duration.end === 'Present' ? new Date().toISOString() : a.duration.end;
    const endB = b.duration.end === 'Present' ? new Date().toISOString() : b.duration.end;
    
    // Compare end dates first (most recent first)
    if (endA !== endB) {
      return endA > endB ? -1 : 1;
    }
    
    // If end dates are the same, compare start dates
    return a.duration.start > b.duration.start ? -1 : 1;
  });
};

/**
 * Filter experiences by company
 */
export const filterExperiencesByCompany = (
  experiences: Experience[], 
  company: string
): Experience[] => {
  if (!company) return experiences;
  return experiences.filter(exp => 
    exp.company.toLowerCase().includes(company.toLowerCase())
  );
};

/**
 * Filter experiences by skill
 */
export const filterExperiencesBySkill = (
  experiences: Experience[], 
  skill: string
): Experience[] => {
  if (!skill) return experiences;
  return experiences.filter(exp => 
    exp.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  );
};

/**
 * Get total years of experience from all experiences
 */
export const calculateTotalYearsOfExperience = (experiences: Experience[]): number => {
  let totalMonths = 0;
  
  experiences.forEach(exp => {
    // Parse start date
    const startParts = exp.duration.start.split(' ');
    const startMonth = getMonthNumber(startParts[0]);
    const startYear = parseInt(startParts[1]);
    
    // Parse end date
    let endMonth, endYear;
    if (exp.duration.end === 'Present') {
      const now = new Date();
      endMonth = now.getMonth();
      endYear = now.getFullYear();
    } else {
      const endParts = exp.duration.end.split(' ');
      endMonth = getMonthNumber(endParts[0]);
      endYear = parseInt(endParts[1]);
    }
    
    // Calculate months
    totalMonths += (endYear - startYear) * 12 + (endMonth - startMonth);
  });
  
  // Convert to years (rounded to 1 decimal place)
  return Math.round((totalMonths / 12) * 10) / 10;
};

/**
 * Helper function to convert month name to number
 */
const getMonthNumber = (monthName: string): number => {
  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  return months[monthName] || 0;
};

/**
 * Extract all unique skills from experiences
 */
export const extractUniqueSkills = (experiences: Experience[]): string[] => {
  const skillsSet = new Set<string>();
  
  experiences.forEach(exp => {
    exp.skills.forEach(skill => {
      skillsSet.add(skill);
    });
  });
  
  return Array.from(skillsSet).sort();
};

/**
 * Group experiences by company
 */
export const groupExperiencesByCompany = (
  experiences: Experience[]
): Record<string, Experience[]> => {
  return experiences.reduce((acc, exp) => {
    if (!acc[exp.company]) {
      acc[exp.company] = [];
    }
    acc[exp.company].push(exp);
    return acc;
  }, {} as Record<string, Experience[]>);
};

/**
 * Calculate skill frequency across experiences
 */
export const calculateSkillFrequency = (
  experiences: Experience[]
): Record<string, number> => {
  const skillFrequency: Record<string, number> = {};
  
  experiences.forEach(exp => {
    exp.skills.forEach(skill => {
      if (!skillFrequency[skill]) {
        skillFrequency[skill] = 0;
      }
      skillFrequency[skill]++;
    });
  });
  
  return skillFrequency;
};

/**
 * Advanced filtering function for experiences
 */
export const filterExperiences = (
  experiences: Experience[],
  filter: ExperienceFilter
): Experience[] => {
  return experiences.filter(exp => {
    // Company filter
    if (filter.company && !exp.company.toLowerCase().includes(filter.company.toLowerCase())) {
      return false;
    }

    // Skills filter (must have at least one matching skill)
    if (filter.skills && filter.skills.length > 0) {
      const hasMatchingSkill = filter.skills.some(skill =>
        exp.skills.some(expSkill => 
          expSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasMatchingSkill) return false;
    }

    // Date range filter
    if (filter.dateRange) {
      const expStartDate = parseExperienceDate(exp.duration.start);
      const expEndDate = exp.duration.end === 'Present' ? new Date() : parseExperienceDate(exp.duration.end);
      
      if (filter.dateRange.start) {
        const filterStartDate = parseExperienceDate(filter.dateRange.start);
        if (expEndDate && filterStartDate && expEndDate < filterStartDate) {
          return false;
        }
      }

      if (filter.dateRange.end) {
        const filterEndDate = parseExperienceDate(filter.dateRange.end);
        if (expStartDate && filterEndDate && expStartDate > filterEndDate) {
          return false;
        }
      }
    }

    // Type filter
    if (filter.type && exp.type !== filter.type) {
      return false;
    }

    // Industry filter
    if (filter.industry && (!exp.industry || !exp.industry.toLowerCase().includes(filter.industry.toLowerCase()))) {
      return false;
    }

    // Featured filter
    if (filter.featured !== undefined && exp.featured !== filter.featured) {
      return false;
    }

    // Remote filter
    if (filter.isRemote !== undefined && exp.isRemote !== filter.isRemote) {
      return false;
    }

    // Tags filter (must have at least one matching tag)
    if (filter.tags && filter.tags.length > 0) {
      if (!exp.tags || exp.tags.length === 0) return false;
      const hasMatchingTag = filter.tags.some(tag =>
        exp.tags!.some(expTag => 
          expTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
};

/**
 * Advanced sorting function for experiences
 */
export const sortExperiences = (
  experiences: Experience[],
  sortOptions: ExperienceSortOptions
): Experience[] => {
  return [...experiences].sort((a, b) => {
    let comparison = 0;

    switch (sortOptions.field) {
      case 'startDate':
        const aStartDate = parseExperienceDate(a.duration.start);
        const bStartDate = parseExperienceDate(b.duration.start);
        if (aStartDate && bStartDate) {
          comparison = aStartDate.getTime() - bStartDate.getTime();
        }
        break;

      case 'endDate':
        const aEndDate = a.duration.end === 'Present' ? new Date() : parseExperienceDate(a.duration.end);
        const bEndDate = b.duration.end === 'Present' ? new Date() : parseExperienceDate(b.duration.end);
        if (aEndDate && bEndDate) {
          comparison = aEndDate.getTime() - bEndDate.getTime();
        }
        break;

      case 'company':
        comparison = a.company.localeCompare(b.company);
        break;

      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;

      case 'duration':
        const aDuration = calculateExperienceDuration(a);
        const bDuration = calculateExperienceDuration(b);
        comparison = aDuration - bDuration;
        break;

      default:
        comparison = 0;
    }

    return sortOptions.direction === 'desc' ? -comparison : comparison;
  });
};

/**
 * Calculate duration of a single experience in months
 */
export const calculateExperienceDuration = (experience: Experience): number => {
  const startDate = parseExperienceDate(experience.duration.start);
  const endDate = experience.duration.end === 'Present' ? new Date() : parseExperienceDate(experience.duration.end);
  
  if (!startDate || !endDate) return 0;
  
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  
  return yearDiff * 12 + monthDiff;
};

/**
 * Calculate comprehensive statistics from experiences
 */
export const calculateExperienceStats = (experiences: Experience[]): ExperienceStats => {
  const totalYears = calculateTotalYearsOfExperience(experiences);
  const uniqueSkills = extractUniqueSkills(experiences);
  const skillFrequency = calculateSkillFrequency(experiences);
  
  // Calculate average tenure
  const totalDuration = experiences.reduce((sum, exp) => sum + calculateExperienceDuration(exp), 0);
  const averageTenure = experiences.length > 0 ? totalDuration / experiences.length : 0;
  
  // Company types distribution
  const companyTypes: Record<string, number> = {};
  experiences.forEach(exp => {
    if (exp.companySize) {
      companyTypes[exp.companySize] = (companyTypes[exp.companySize] || 0) + 1;
    }
  });
  
  // Industry distribution
  const industryDistribution: Record<string, number> = {};
  experiences.forEach(exp => {
    if (exp.industry) {
      industryDistribution[exp.industry] = (industryDistribution[exp.industry] || 0) + 1;
    }
  });
  
  // Unique companies
  const uniqueCompanies = new Set(experiences.map(exp => exp.company)).size;
  
  return {
    totalExperiences: experiences.length,
    totalYears,
    companiesWorkedAt: uniqueCompanies,
    uniqueSkills: uniqueSkills.length,
    featuredExperiences: experiences.filter(exp => exp.featured).length,
    averageTenure: Math.round(averageTenure * 10) / 10, // Round to 1 decimal place
    skillFrequency,
    companyTypes,
    industryDistribution,
  };
};

/**
 * Search experiences by text query
 */
export const searchExperiences = (
  experiences: Experience[],
  query: string
): Experience[] => {
  if (!query || query.trim() === '') return experiences;
  
  const searchTerm = query.toLowerCase().trim();
  
  return experiences.filter(exp => {
    // Search in title, company, description
    const textFields = [
      exp.title,
      exp.company,
      exp.description,
      exp.industry || '',
      exp.location || '',
      ...(exp.achievements || []),
      ...(exp.skills || []),
      ...(exp.responsibilities || []),
      ...(exp.technologies || []),
      ...(exp.tags || [])
    ].join(' ').toLowerCase();
    
    return textFields.includes(searchTerm);
  });
};

/**
 * Get experiences by skill with relevance scoring
 */
export const getExperiencesBySkill = (
  experiences: Experience[],
  skill: string
): { experience: Experience; relevance: number }[] => {
  const skillLower = skill.toLowerCase();
  
  return experiences
    .map(exp => {
      let relevance = 0;
      
      // Check skills array
      exp.skills.forEach(expSkill => {
        if (expSkill.toLowerCase() === skillLower) relevance += 3;
        else if (expSkill.toLowerCase().includes(skillLower)) relevance += 2;
      });
      
      // Check technologies array
      if (exp.technologies) {
        exp.technologies.forEach(tech => {
          if (tech.toLowerCase() === skillLower) relevance += 2;
          else if (tech.toLowerCase().includes(skillLower)) relevance += 1;
        });
      }
      
      // Check title and description
      if (exp.title.toLowerCase().includes(skillLower)) relevance += 1;
      if (exp.description.toLowerCase().includes(skillLower)) relevance += 1;
      
      return { experience: exp, relevance };
    })
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
};

/**
 * Generate career progression insights
 */
export const generateCareerProgression = (experiences: Experience[]): {
  progression: string[];
  skillEvolution: Record<string, string[]>;
  careerPath: string;
} => {
  const sortedExperiences = sortExperiencesByDate(experiences);
  
  // Generate progression titles
  const progression = sortedExperiences.map(exp => `${exp.title} at ${exp.company}`);
  
  // Track skill evolution over time
  const skillEvolution: Record<string, string[]> = {};
  sortedExperiences.reverse().forEach(exp => {
    exp.skills.forEach(skill => {
      if (!skillEvolution[skill]) {
        skillEvolution[skill] = [];
      }
      skillEvolution[skill].push(`${exp.company} (${exp.duration.start})`);
    });
  });
  
  // Generate career path summary
  const companies = sortedExperiences.map(exp => exp.company);
  const careerPath = `Career progression through ${companies.length} companies: ${companies.join(' → ')}`;
  
  return {
    progression,
    skillEvolution,
    careerPath
  };
};

/**
 * Enhanced CV data generation with synchronization options
 */
export const generateCVData = (
  experiences: Experience[],
  pdfUrl: string,
  options: CVSyncOptions = {}
): CVSyncResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    // Validate experiences first
    const validationResult = validateExperiences(experiences);
    if (!validationResult.isValid) {
      validationResult.errors.forEach(error => {
        errors.push(`${error.field}: ${error.message}`);
      });
    }
    
    // Use validated experiences or original if validation passed
    let processedExperiences = validationResult.data || experiences;
    
    // Sanitize experiences
    processedExperiences = processedExperiences.map(sanitizeExperience);
    
    // Apply filtering options
    if (!options.includeAllExperiences) {
      processedExperiences = processedExperiences.filter(exp => exp.featured);
      if (processedExperiences.length === 0) {
        warnings.push('No featured experiences found, including all experiences');
        processedExperiences = experiences;
      }
    }
    
    // Limit number of experiences
    if (options.maxExperiences && processedExperiences.length > options.maxExperiences) {
      processedExperiences = processedExperiences.slice(0, options.maxExperiences);
      warnings.push(`Limited to ${options.maxExperiences} experiences`);
    }
    
    // Sort experiences by date (most recent first)
    const sortedExperiences = sortExperiencesByDate(processedExperiences);
    
    // Extract unique skills
    const skills = extractUniqueSkills(processedExperiences);
    
    // Calculate total years of experience
    const totalYears = calculateTotalYearsOfExperience(processedExperiences);
    
    // Generate dynamic summary
    const stats = calculateExperienceStats(processedExperiences);
    const topSkills = Object.entries(stats.skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([skill]) => skill);
    
    const summary = `Experienced professional with ${totalYears} years of experience across ${stats.companiesWorkedAt} companies and ${processedExperiences.length} roles, specializing in ${topSkills.join(', ')}.`;
    
    // Mock education data (in a real app, this would come from a data source)
    const education: Education[] = [
      {
        id: 'edu-1',
        institution: 'University of London',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        duration: {
          start: 'Sep 2011',
          end: 'Jun 2015',
        },
        description: 'Graduated with honors. Specialized in Human-Computer Interaction and Digital Media.',
      }
    ];
    
    // Mock certifications (in a real app, this would come from a data source)
    const certifications: Certification[] = [
      {
        id: 'cert-1',
        name: 'Project Management Professional (PMP)',
        issuer: 'Project Management Institute',
        date: 'Jan 2020',
        url: 'https://www.pmi.org/',
      },
      {
        id: 'cert-2',
        name: 'Google Professional Machine Learning Engineer',
        issuer: 'Google Cloud',
        date: 'Mar 2022',
        url: 'https://cloud.google.com/certification/machine-learning-engineer',
      }
    ];
    
    // Create CV data structure
    const cvData: CVData = {
      pdfUrl,
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: {
        summary,
        experiences: sortedExperiences,
        skills,
        education,
        certifications,
      }
    };
    
    return {
      success: true,
      cvData,
      warnings,
      errors,
      lastSyncDate: new Date().toISOString()
    };
    
  } catch (error) {
    errors.push(`Failed to generate CV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Return minimal CV data structure on error
    const fallbackCvData: CVData = {
      pdfUrl,
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: {
        summary: 'Error generating summary',
        experiences: [],
        skills: [],
        education: [],
        certifications: [],
      }
    };
    
    return {
      success: false,
      cvData: fallbackCvData,
      warnings,
      errors,
      lastSyncDate: new Date().toISOString()
    };
  }
};

/**
 * Export experiences to different formats
 */
export const exportExperiences = (
  experiences: Experience[],
  format: 'json' | 'csv' | 'xml'
): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(experiences, null, 2);
      
    case 'csv':
      const headers = ['ID', 'Title', 'Company', 'Start Date', 'End Date', 'Skills', 'Featured'];
      const rows = experiences.map(exp => [
        exp.id,
        exp.title,
        exp.company,
        exp.duration.start,
        exp.duration.end,
        exp.skills.join('; '),
        exp.featured.toString()
      ]);
      
      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      
    case 'xml':
      const xmlExperiences = experiences.map(exp => `
        <experience id="${exp.id}">
          <title>${exp.title}</title>
          <company>${exp.company}</company>
          <duration>
            <start>${exp.duration.start}</start>
            <end>${exp.duration.end}</end>
          </duration>
          <skills>
            ${exp.skills.map(skill => `<skill>${skill}</skill>`).join('')}
          </skills>
          <featured>${exp.featured}</featured>
        </experience>
      `).join('');
      
      return `<?xml version="1.0" encoding="UTF-8"?>\n<experiences>${xmlExperiences}\n</experiences>`;
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};