import { ValidationContext } from '../validation.context';
import { ValidationError } from './validation-error.interface';

export const VALIDATION_RULE = 'VALIDATION_RULE';

export interface ValidationRule {
  validate(context: ValidationContext): ValidationError[] | Promise<ValidationError[]>;
}
