import { Experience, ValidationError, ValidationResult, Education, Certification } from './types';

/**
 * Validation utilities for experience data management
 */

// Regular expressions for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
const URL_REGEX = /^https?:\/\/.+/;
const DATE_REGEX = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;

/**
 * Validate a single experience object
 */
export const validateExperience = (experience: Partial<Experience>): ValidationResult<Experience> => {
  const errors: ValidationError[] = [];

  // Required field validations
  if (!experience.id || experience.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Experience ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!experience.title || experience.title.trim() === '') {
    errors.push({
      field: 'title',
      message: 'Job title is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!experience.company || experience.company.trim() === '') {
    errors.push({
      field: 'company',
      message: 'Company name is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!experience.description || experience.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Job description is required',
      code: 'REQUIRED_FIELD'
    });
  }

  // Duration validation
  if (!experience.duration) {
    errors.push({
      field: 'duration',
      message: 'Duration is required',
      code: 'REQUIRED_FIELD'
    });
  } else {
    if (!experience.duration.start || !DATE_REGEX.test(experience.duration.start)) {
      errors.push({
        field: 'duration.start',
        message: 'Start date must be in format "MMM YYYY" (e.g., "Jan 2020")',
        code: 'INVALID_FORMAT'
      });
    }

    if (!experience.duration.end || (experience.duration.end !== 'Present' && !DATE_REGEX.test(experience.duration.end))) {
      errors.push({
        field: 'duration.end',
        message: 'End date must be "Present" or in format "MMM YYYY" (e.g., "Dec 2021")',
        code: 'INVALID_FORMAT'
      });
    }

    // Check if start date is before end date
    if (experience.duration.start && experience.duration.end && experience.duration.end !== 'Present') {
      const startDate = parseExperienceDate(experience.duration.start);
      const endDate = parseExperienceDate(experience.duration.end);
      
      if (startDate && endDate && startDate >= endDate) {
        errors.push({
          field: 'duration',
          message: 'Start date must be before end date',
          code: 'INVALID_DATE_RANGE'
        });
      }
    }
  }

  // Array validations
  if (!experience.achievements || !Array.isArray(experience.achievements)) {
    errors.push({
      field: 'achievements',
      message: 'Achievements must be an array',
      code: 'INVALID_TYPE'
    });
  } else if (experience.achievements.length === 0) {
    errors.push({
      field: 'achievements',
      message: 'At least one achievement is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!experience.skills || !Array.isArray(experience.skills)) {
    errors.push({
      field: 'skills',
      message: 'Skills must be an array',
      code: 'INVALID_TYPE'
    });
  } else if (experience.skills.length === 0) {
    errors.push({
      field: 'skills',
      message: 'At least one skill is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!experience.projects || !Array.isArray(experience.projects)) {
    errors.push({
      field: 'projects',
      message: 'Projects must be an array',
      code: 'INVALID_TYPE'
    });
  }

  // Optional field validations
  if (experience.type && !['full-time', 'contract', 'freelance', 'internship'].includes(experience.type)) {
    errors.push({
      field: 'type',
      message: 'Type must be one of: full-time, contract, freelance, internship',
      code: 'INVALID_VALUE'
    });
  }

  if (experience.companySize && !['startup', 'small', 'medium', 'large', 'enterprise'].includes(experience.companySize)) {
    errors.push({
      field: 'companySize',
      message: 'Company size must be one of: startup, small, medium, large, enterprise',
      code: 'INVALID_VALUE'
    });
  }

  if (experience.companyWebsite && !URL_REGEX.test(experience.companyWebsite)) {
    errors.push({
      field: 'companyWebsite',
      message: 'Company website must be a valid URL',
      code: 'INVALID_FORMAT'
    });
  }

  if (experience.linkedInUrl && !URL_REGEX.test(experience.linkedInUrl)) {
    errors.push({
      field: 'linkedInUrl',
      message: 'LinkedIn URL must be a valid URL',
      code: 'INVALID_FORMAT'
    });
  }

  if (experience.companyLogo && !URL_REGEX.test(experience.companyLogo)) {
    errors.push({
      field: 'companyLogo',
      message: 'Company logo must be a valid URL',
      code: 'INVALID_FORMAT'
    });
  }

  // References validation
  if (experience.references) {
    experience.references.forEach((ref, index) => {
      if (!ref.name || ref.name.trim() === '') {
        errors.push({
          field: `references[${index}].name`,
          message: 'Reference name is required',
          code: 'REQUIRED_FIELD'
        });
      }

      if (!ref.title || ref.title.trim() === '') {
        errors.push({
          field: `references[${index}].title`,
          message: 'Reference title is required',
          code: 'REQUIRED_FIELD'
        });
      }

      if (ref.email && !EMAIL_REGEX.test(ref.email)) {
        errors.push({
          field: `references[${index}].email`,
          message: 'Reference email must be valid',
          code: 'INVALID_FORMAT'
        });
      }

      if (ref.phone && !PHONE_REGEX.test(ref.phone)) {
        errors.push({
          field: `references[${index}].phone`,
          message: 'Reference phone must be valid',
          code: 'INVALID_FORMAT'
        });
      }

      if (ref.linkedIn && !URL_REGEX.test(ref.linkedIn)) {
        errors.push({
          field: `references[${index}].linkedIn`,
          message: 'Reference LinkedIn URL must be valid',
          code: 'INVALID_FORMAT'
        });
      }
    });
  }

  // Salary validation
  if (experience.salary) {
    if (!experience.salary.currency || experience.salary.currency.trim() === '') {
      errors.push({
        field: 'salary.currency',
        message: 'Salary currency is required when salary is provided',
        code: 'REQUIRED_FIELD'
      });
    }

    if (experience.salary.range) {
      if (experience.salary.range.min >= experience.salary.range.max) {
        errors.push({
          field: 'salary.range',
          message: 'Salary minimum must be less than maximum',
          code: 'INVALID_RANGE'
        });
      }
    }
  }

  // Numeric validations
  if (experience.teamSize !== undefined && (experience.teamSize < 0 || !Number.isInteger(experience.teamSize))) {
    errors.push({
      field: 'teamSize',
      message: 'Team size must be a non-negative integer',
      code: 'INVALID_VALUE'
    });
  }

  if (experience.directReports !== undefined && (experience.directReports < 0 || !Number.isInteger(experience.directReports))) {
    errors.push({
      field: 'directReports',
      message: 'Direct reports must be a non-negative integer',
      code: 'INVALID_VALUE'
    });
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? experience as Experience : undefined,
    errors
  };
};

/**
 * Validate an array of experiences
 */
export const validateExperiences = (experiences: Partial<Experience>[]): ValidationResult<Experience[]> => {
  const allErrors: ValidationError[] = [];
  const validExperiences: Experience[] = [];

  experiences.forEach((experience, index) => {
    const result = validateExperience(experience);
    
    if (result.isValid && result.data) {
      validExperiences.push(result.data);
    } else {
      // Prefix field names with array index
      result.errors.forEach(error => {
        allErrors.push({
          ...error,
          field: `experiences[${index}].${error.field}`
        });
      });
    }
  });

  // Check for duplicate IDs
  const ids = experiences.map(exp => exp.id).filter(Boolean);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    duplicateIds.forEach(id => {
      allErrors.push({
        field: 'id',
        message: `Duplicate experience ID: ${id}`,
        code: 'DUPLICATE_ID'
      });
    });
  }

  return {
    isValid: allErrors.length === 0,
    data: allErrors.length === 0 ? validExperiences : undefined,
    errors: allErrors
  };
};

/**
 * Validate education data
 */
export const validateEducation = (education: Partial<Education>): ValidationResult<Education> => {
  const errors: ValidationError[] = [];

  if (!education.id || education.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Education ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!education.institution || education.institution.trim() === '') {
    errors.push({
      field: 'institution',
      message: 'Institution name is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!education.degree || education.degree.trim() === '') {
    errors.push({
      field: 'degree',
      message: 'Degree is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!education.field || education.field.trim() === '') {
    errors.push({
      field: 'field',
      message: 'Field of study is required',
      code: 'REQUIRED_FIELD'
    });
  }

  // Duration validation
  if (!education.duration) {
    errors.push({
      field: 'duration',
      message: 'Duration is required',
      code: 'REQUIRED_FIELD'
    });
  } else {
    if (!education.duration.start || !DATE_REGEX.test(education.duration.start)) {
      errors.push({
        field: 'duration.start',
        message: 'Start date must be in format "MMM YYYY"',
        code: 'INVALID_FORMAT'
      });
    }

    if (!education.duration.end || !DATE_REGEX.test(education.duration.end)) {
      errors.push({
        field: 'duration.end',
        message: 'End date must be in format "MMM YYYY"',
        code: 'INVALID_FORMAT'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? education as Education : undefined,
    errors
  };
};

/**
 * Validate certification data
 */
export const validateCertification = (certification: Partial<Certification>): ValidationResult<Certification> => {
  const errors: ValidationError[] = [];

  if (!certification.id || certification.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Certification ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!certification.name || certification.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Certification name is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!certification.issuer || certification.issuer.trim() === '') {
    errors.push({
      field: 'issuer',
      message: 'Issuer is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!certification.date || !DATE_REGEX.test(certification.date)) {
    errors.push({
      field: 'date',
      message: 'Date must be in format "MMM YYYY"',
      code: 'INVALID_FORMAT'
    });
  }

  if (certification.url && !URL_REGEX.test(certification.url)) {
    errors.push({
      field: 'url',
      message: 'URL must be valid',
      code: 'INVALID_FORMAT'
    });
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? certification as Certification : undefined,
    errors
  };
};

/**
 * Helper function to parse experience date strings
 */
export const parseExperienceDate = (dateString: string): Date | null => {
  if (dateString === 'Present') {
    return new Date();
  }

  const match = dateString.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{4})$/);
  if (!match) return null;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = monthNames.indexOf(match[1]);
  const year = parseInt(match[2]);

  return new Date(year, monthIndex, 1);
};

/**
 * Sanitize experience data by removing potentially harmful content
 */
export const sanitizeExperience = (experience: Experience): Experience => {
  const sanitizeString = (str: string): string => {
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
              .trim();
  };

  const sanitizeArray = (arr: string[]): string[] => {
    return arr.map(sanitizeString).filter(item => item.length > 0);
  };

  return {
    ...experience,
    title: sanitizeString(experience.title),
    company: sanitizeString(experience.company),
    location: experience.location ? sanitizeString(experience.location) : undefined,
    description: sanitizeString(experience.description),
    achievements: sanitizeArray(experience.achievements),
    skills: sanitizeArray(experience.skills),
    responsibilities: experience.responsibilities ? sanitizeArray(experience.responsibilities) : undefined,
    technologies: experience.technologies ? sanitizeArray(experience.technologies) : undefined,
    industry: experience.industry ? sanitizeString(experience.industry) : undefined,
    reportingTo: experience.reportingTo ? sanitizeString(experience.reportingTo) : undefined,
    companyWebsite: experience.companyWebsite ? sanitizeString(experience.companyWebsite) : undefined,
    linkedInUrl: experience.linkedInUrl ? sanitizeString(experience.linkedInUrl) : undefined,
    companyLogo: experience.companyLogo ? sanitizeString(experience.companyLogo) : undefined,
    tags: experience.tags ? sanitizeArray(experience.tags) : undefined,
  };
};