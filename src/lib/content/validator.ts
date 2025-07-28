// Content validation system with comprehensive error handling

import { 
  ContentValidationResult, 
  ContentError, 
  ContentValidationRule, 
  ContentSchema,
  ContentMetadata 
} from './types';
import { SchemaRegistry } from './schemas';

export class ContentValidator {
  /**
   * Validate content against its schema
   */
  static validate<T extends ContentMetadata>(
    content: Partial<T>, 
    contentType: string
  ): ContentValidationResult {
    const schema = SchemaRegistry.getSchema(contentType);
    if (!schema) {
      return {
        isValid: false,
        errors: [{
          field: 'schema',
          message: `No schema found for content type: ${contentType}`,
          code: 'SCHEMA_NOT_FOUND',
          severity: 'error'
        }],
        warnings: []
      };
    }

    const errors: ContentError[] = [];
    const warnings: ContentError[] = [];

    // Validate required fields
    this.validateRequiredFields(content, schema, errors);

    // Validate field types and constraints
    this.validateFields(content, schema, errors, warnings);

    // Run custom validation rules
    this.validateCustomRules(content, schema, errors, warnings);

    // Validate metadata fields
    this.validateMetadata(content, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: errors.length === 0 ? content : undefined
    };
  }

  /**
   * Validate required fields
   */
  private static validateRequiredFields(
    content: any, 
    schema: ContentSchema, 
    errors: ContentError[]
  ): void {
    Object.entries(schema.fields).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.required && (content[fieldName] === undefined || content[fieldName] === null)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} is required`,
          code: 'REQUIRED_FIELD_MISSING',
          severity: 'error'
        });
      }
    });
  }

  /**
   * Validate field types and constraints
   */
  private static validateFields(
    content: any, 
    schema: ContentSchema, 
    errors: ContentError[], 
    warnings: ContentError[]
  ): void {
    Object.entries(content).forEach(([fieldName, fieldValue]) => {
      const fieldConfig = schema.fields[fieldName];
      if (!fieldConfig) {
        warnings.push({
          field: fieldName,
          message: `Unknown field: ${fieldName}`,
          code: 'UNKNOWN_FIELD',
          severity: 'warning'
        });
        return;
      }

      // Type validation
      if (!this.validateFieldType(fieldValue, fieldConfig.type)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be of type ${fieldConfig.type}`,
          code: 'INVALID_TYPE',
          severity: 'error'
        });
        return;
      }

      // Field-specific validation rules
      if (fieldConfig.validation) {
        fieldConfig.validation.forEach(rule => {
          const result = this.validateRule(fieldValue, rule);
          if (!result.isValid) {
            errors.push({
              field: fieldName,
              message: result.message,
              code: result.code,
              severity: 'error'
            });
          }
        });
      }
    });
  }

  /**
   * Validate custom schema rules
   */
  private static validateCustomRules(
    content: any, 
    schema: ContentSchema, 
    errors: ContentError[], 
    warnings: ContentError[]
  ): void {
    schema.validation.forEach(rule => {
      const result = this.validateRule(content, rule);
      if (!result.isValid) {
        errors.push({
          field: rule.field,
          message: result.message,
          code: result.code,
          severity: 'error'
        });
      }
    });
  }

  /**
   * Validate metadata fields
   */
  private static validateMetadata(
    content: any, 
    errors: ContentError[], 
    warnings: ContentError[]
  ): void {
    // Validate ID format
    if (content.id && typeof content.id === 'string') {
      if (!/^[a-z0-9-]+$/.test(content.id)) {
        errors.push({
          field: 'id',
          message: 'ID must contain only lowercase letters, numbers, and hyphens',
          code: 'INVALID_ID_FORMAT',
          severity: 'error'
        });
      }
    }

    // Validate slug format
    if (content.slug && typeof content.slug === 'string') {
      if (!/^[a-z0-9-]+$/.test(content.slug)) {
        errors.push({
          field: 'slug',
          message: 'Slug must contain only lowercase letters, numbers, and hyphens',
          code: 'INVALID_SLUG_FORMAT',
          severity: 'error'
        });
      }
    }

    // Validate status
    if (content.status && !['draft', 'published', 'archived'].includes(content.status)) {
      errors.push({
        field: 'status',
        message: 'Status must be one of: draft, published, archived',
        code: 'INVALID_STATUS',
        severity: 'error'
      });
    }

    // Validate dates
    if (content.createdAt && !this.isValidDate(content.createdAt)) {
      errors.push({
        field: 'createdAt',
        message: 'createdAt must be a valid ISO date string',
        code: 'INVALID_DATE',
        severity: 'error'
      });
    }

    if (content.updatedAt && !this.isValidDate(content.updatedAt)) {
      errors.push({
        field: 'updatedAt',
        message: 'updatedAt must be a valid ISO date string',
        code: 'INVALID_DATE',
        severity: 'error'
      });
    }

    // Validate tags
    if (content.tags && !Array.isArray(content.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
        code: 'INVALID_TYPE',
        severity: 'error'
      });
    } else if (content.tags && Array.isArray(content.tags)) {
      content.tags.forEach((tag: any, index: number) => {
        if (typeof tag !== 'string') {
          errors.push({
            field: `tags[${index}]`,
            message: 'All tags must be strings',
            code: 'INVALID_TYPE',
            severity: 'error'
          });
        }
      });
    }

    // Validate categories
    if (content.categories && !Array.isArray(content.categories)) {
      errors.push({
        field: 'categories',
        message: 'Categories must be an array',
        code: 'INVALID_TYPE',
        severity: 'error'
      });
    }
  }

  /**
   * Validate field type
   */
  private static validateFieldType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return this.isValidDate(value);
      default:
        return true;
    }
  }

  /**
   * Validate individual rule
   */
  private static validateRule(value: any, rule: ContentValidationRule): {
    isValid: boolean;
    message: string;
    code: string;
  } {
    switch (rule.type) {
      case 'required':
        return {
          isValid: value !== undefined && value !== null && value !== '',
          message: rule.message,
          code: 'REQUIRED_FIELD_MISSING'
        };

      case 'minLength':
        return {
          isValid: typeof value === 'string' && value.length >= (rule.value || 0),
          message: rule.message,
          code: 'MIN_LENGTH_VIOLATION'
        };

      case 'maxLength':
        return {
          isValid: typeof value === 'string' && value.length <= (rule.value || Infinity),
          message: rule.message,
          code: 'MAX_LENGTH_VIOLATION'
        };

      case 'pattern':
        return {
          isValid: typeof value === 'string' && (rule.value as RegExp).test(value),
          message: rule.message,
          code: 'PATTERN_MISMATCH'
        };

      case 'custom':
        return {
          isValid: rule.validator ? rule.validator(value) : true,
          message: rule.message,
          code: 'CUSTOM_VALIDATION_FAILED'
        };

      default:
        return {
          isValid: true,
          message: '',
          code: 'UNKNOWN_RULE'
        };
    }
  }

  /**
   * Check if value is a valid date
   */
  private static isValidDate(value: any): boolean {
    if (typeof value === 'string') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * Validate batch of content items
   */
  static validateBatch<T extends ContentMetadata>(
    items: Partial<T>[], 
    contentType: string
  ): {
    results: ContentValidationResult[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      warnings: number;
    };
  } {
    const results = items.map(item => this.validate(item, contentType));
    
    const summary = {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      warnings: results.reduce((sum, r) => sum + r.warnings.length, 0)
    };

    return { results, summary };
  }

  /**
   * Get validation summary for content
   */
  static getValidationSummary(result: ContentValidationResult): string {
    if (result.isValid) {
      const warningText = result.warnings.length > 0 
        ? ` with ${result.warnings.length} warning(s)` 
        : '';
      return `Content is valid${warningText}`;
    }

    return `Content is invalid: ${result.errors.length} error(s), ${result.warnings.length} warning(s)`;
  }

  /**
   * Format validation errors for display
   */
  static formatErrors(errors: ContentError[]): string[] {
    return errors.map(error => `${error.field}: ${error.message}`);
  }

  /**
   * Check if content has critical errors
   */
  static hasCriticalErrors(result: ContentValidationResult): boolean {
    return result.errors.some(error => error.severity === 'error');
  }
}