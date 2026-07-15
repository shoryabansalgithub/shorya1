import { ValidationCategory } from '../enums/validation-category.enum';
import { ValidationSeverity } from '../enums/validation-severity.enum';

export interface ValidationError {
  domain: string;
  property?: string;
  dependency?: string;
  reason: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  resolution: string;
}
