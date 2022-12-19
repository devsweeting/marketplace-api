/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RawBody } from './raw-body.decorator';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { FormValidationError } from '../exceptions/form-validation-error.exception';

// /**
//  * generates custom error message used on forms validation:
//  * Example:
//   {
//     "property_name": [
//         "constraint should not be empty",
//         "constraint must be a string"
//     ],
//     "property_name": [
//         "constraint should not be empty",
//         "constraint must be a string"
//     ]
//   }
// */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const ValidateFormBody = () =>
  RawBody(
    new ValidationPipe({
      validateCustomDecorators: true,
      forbidUnknownValues: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: false },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const customValidationErrors = generateErrorMessage(validationErrors);
        return new FormValidationError(customValidationErrors);
      },
    }),
  );

function generateErrorMessage(validationErrors: ValidationError[]): Record<string, string[]> {
  const customErrors: Record<string, string[]> = {};
  for (const error of validationErrors) {
    if (error.children && error.children.length >= 1) {
      for (const child of error.children) {
        customErrors[child.property] = Object.values(child.constraints);
      }
    } else {
      customErrors[error.property] = Object.values(error.constraints);
    }
  }
  return customErrors;
}
