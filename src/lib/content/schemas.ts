// Content validation schemas for different content types

import { ContentSchema, ContentValidationRule } from './types';

// Common validation rules
const commonRules = {
  required: (field: string): ContentValidationRule => ({
    field,
    type: 'required',
    message: `${field} is required`
  }),
  
  minLength: (field: string, length: number): ContentValidationRule => ({
    field,
    type: 'minLength',
    value: length,
    message: `${field} must be at least ${length} characters long`
  }),
  
  maxLength: (field: string, length: number): ContentValidationRule => ({
    field,
    type: 'maxLength',
    value: length,
    message: `${field} must not exceed ${length} characters`
  }),
  
  pattern: (field: string, pattern: RegExp, message: string): ContentValidationRule => ({
    field,
    type: 'pattern',
    value: pattern,
    message
  }),
  
  custom: (field: string, validator: (value: any) => boolean, message: string): ContentValidationRule => ({
    field,
    type: 'custom',
    validator,
    message
  })
};

// Project schema
export const projectSchema: ContentSchema = {
  type: 'project',
  fields: {
    title: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('title', 3),
        commonRules.maxLength('title', 100)
      ]
    },
    client: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('client', 2),
        commonRules.maxLength('client', 50)
      ]
    },
    category: {
      type: 'string',
      required: true,
      validation: [
        commonRules.custom('category', 
          (value) => ['ai', 'digital', 'production'].includes(value),
          'Category must be one of: ai, digital, production'
        )
      ]
    },
    description: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('description', 50),
        commonRules.maxLength('description', 2000)
      ]
    },
    shortDescription: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('shortDescription', 20),
        commonRules.maxLength('shortDescription', 200)
      ]
    },
    technologies: {
      type: 'array',
      required: true,
      validation: [
        commonRules.custom('technologies',
          (value) => Array.isArray(value) && value.length > 0,
          'At least one technology must be specified'
        )
      ]
    },
    timeline: {
      type: 'string',
      required: true,
      validation: [
        commonRules.pattern('timeline', 
          /^\d+\s+(day|week|month|year)s?$/,
          'Timeline must be in format "X days/weeks/months/years"'
        )
      ]
    },
    projectStatus: {
      type: 'string',
      required: true,
      validation: [
        commonRules.custom('projectStatus',
          (value) => ['completed', 'in-progress', 'planned'].includes(value),
          'Project status must be one of: completed, in-progress, planned'
        )
      ]
    },
    media: {
      type: 'object',
      required: true,
      validation: [
        commonRules.custom('media.hero',
          (value) => value && value.hero && typeof value.hero === 'string',
          'Hero image is required'
        ),
        commonRules.custom('media.gallery',
          (value) => value && Array.isArray(value.gallery) && value.gallery.length > 0,
          'At least one gallery image is required'
        )
      ]
    }
  },
  validation: [
    commonRules.custom('dateCompleted',
      (data) => {
        if (data.projectStatus === 'completed' && !data.dateCompleted) {
          return false;
        }
        return true;
      },
      'Completed projects must have a completion date'
    ),
    commonRules.custom('metrics',
      (data) => {
        if (data.metrics && Array.isArray(data.metrics)) {
          return data.metrics.every((metric: any) => 
            metric.label && metric.value && typeof metric.label === 'string' && typeof metric.value === 'string'
          );
        }
        return true;
      },
      'All metrics must have label and value'
    )
  ]
};

// Experience schema
export const experienceSchema: ContentSchema = {
  type: 'experience',
  fields: {
    title: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('title', 3),
        commonRules.maxLength('title', 100)
      ]
    },
    company: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('company', 2),
        commonRules.maxLength('company', 100)
      ]
    },
    duration: {
      type: 'object',
      required: true,
      validation: [
        commonRules.custom('duration',
          (value) => value && value.start && value.end,
          'Both start and end dates are required'
        )
      ]
    },
    description: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('description', 50),
        commonRules.maxLength('description', 1000)
      ]
    },
    achievements: {
      type: 'array',
      required: true,
      validation: [
        commonRules.custom('achievements',
          (value) => Array.isArray(value) && value.length > 0,
          'At least one achievement must be specified'
        )
      ]
    },
    skills: {
      type: 'array',
      required: true,
      validation: [
        commonRules.custom('skills',
          (value) => Array.isArray(value) && value.length > 0,
          'At least one skill must be specified'
        )
      ]
    },
    employmentType: {
      type: 'string',
      required: true,
      validation: [
        commonRules.custom('employmentType',
          (value) => ['full-time', 'contract', 'freelance', 'internship'].includes(value),
          'Employment type must be one of: full-time, contract, freelance, internship'
        )
      ]
    }
  },
  validation: [
    commonRules.custom('dateValidation',
      (data) => {
        if (data.duration && data.duration.start && data.duration.end) {
          const start = new Date(data.duration.start);
          const end = new Date(data.duration.end);
          return start <= end;
        }
        return true;
      },
      'Start date must be before or equal to end date'
    )
  ]
};

// Skill schema
export const skillSchema: ContentSchema = {
  type: 'skill',
  fields: {
    name: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('name', 2),
        commonRules.maxLength('name', 50)
      ]
    },
    category: {
      type: 'string',
      required: true,
      validation: [
        commonRules.custom('category',
          (value) => ['technical', 'soft', 'language', 'certification'].includes(value),
          'Category must be one of: technical, soft, language, certification'
        )
      ]
    },
    proficiency: {
      type: 'string',
      required: true,
      validation: [
        commonRules.custom('proficiency',
          (value) => ['beginner', 'intermediate', 'advanced', 'expert'].includes(value),
          'Proficiency must be one of: beginner, intermediate, advanced, expert'
        )
      ]
    },
    yearsOfExperience: {
      type: 'number',
      required: true,
      validation: [
        commonRules.custom('yearsOfExperience',
          (value) => typeof value === 'number' && value >= 0 && value <= 50,
          'Years of experience must be between 0 and 50'
        )
      ]
    }
  },
  validation: []
};

// Video schema
export const videoSchema: ContentSchema = {
  type: 'video',
  fields: {
    title: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('title', 3),
        commonRules.maxLength('title', 100)
      ]
    },
    description: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('description', 20),
        commonRules.maxLength('description', 500)
      ]
    },
    videoId: {
      type: 'string',
      required: true,
      validation: [
        commonRules.pattern('videoId',
          /^[a-zA-Z0-9_-]{11}$/,
          'Video ID must be a valid YouTube video ID'
        )
      ]
    },
    category: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('category', 2),
        commonRules.maxLength('category', 50)
      ]
    },
    publishedAt: {
      type: 'date',
      required: true,
      validation: [
        commonRules.custom('publishedAt',
          (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime()) && date <= new Date();
          },
          'Published date must be a valid date not in the future'
        )
      ]
    }
  },
  validation: []
};

// Education schema
export const educationSchema: ContentSchema = {
  type: 'education',
  fields: {
    institution: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('institution', 2),
        commonRules.maxLength('institution', 100)
      ]
    },
    degree: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('degree', 2),
        commonRules.maxLength('degree', 100)
      ]
    },
    field: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('field', 2),
        commonRules.maxLength('field', 100)
      ]
    },
    duration: {
      type: 'object',
      required: true,
      validation: [
        commonRules.custom('duration',
          (value) => value && value.start && value.end,
          'Both start and end dates are required'
        )
      ]
    }
  },
  validation: [
    commonRules.custom('dateValidation',
      (data) => {
        if (data.duration && data.duration.start && data.duration.end) {
          const start = new Date(data.duration.start);
          const end = new Date(data.duration.end);
          return start <= end;
        }
        return true;
      },
      'Start date must be before or equal to end date'
    )
  ]
};

// Certification schema
export const certificationSchema: ContentSchema = {
  type: 'certification',
  fields: {
    name: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('name', 3),
        commonRules.maxLength('name', 100)
      ]
    },
    issuer: {
      type: 'string',
      required: true,
      validation: [
        commonRules.minLength('issuer', 2),
        commonRules.maxLength('issuer', 100)
      ]
    },
    date: {
      type: 'date',
      required: true,
      validation: [
        commonRules.custom('date',
          (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime()) && date <= new Date();
          },
          'Certification date must be a valid date not in the future'
        )
      ]
    }
  },
  validation: []
};

// Export all schemas
export const contentSchemas = {
  project: projectSchema,
  experience: experienceSchema,
  skill: skillSchema,
  video: videoSchema,
  education: educationSchema,
  certification: certificationSchema
};

// Schema registry for dynamic access
export class SchemaRegistry {
  private static schemas = contentSchemas;

  static getSchema(type: string): ContentSchema | null {
    return this.schemas[type as keyof typeof this.schemas] || null;
  }

  static getAllSchemas(): Record<string, ContentSchema> {
    return { ...this.schemas };
  }

  static registerSchema(type: string, schema: ContentSchema): void {
    this.schemas = { ...this.schemas, [type]: schema };
  }

  static getValidationRules(type: string): ContentValidationRule[] {
    const schema = this.getSchema(type);
    return schema ? schema.validation : [];
  }

  static getFieldValidation(type: string, field: string): ContentValidationRule[] {
    const schema = this.getSchema(type);
    if (!schema || !schema.fields[field]) {
      return [];
    }
    return schema.fields[field].validation || [];
  }
}