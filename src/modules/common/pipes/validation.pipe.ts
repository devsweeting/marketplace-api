import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export default new ValidationPipe({
  forbidUnknownValues: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  validationError: { target: false },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    const customValidationErrors = generateErrorMessage(validationErrors);
    return new BadRequestException(customValidationErrors);
  },
});

function generateErrorMessage(validationErrors: ValidationError[]): Record<string, string[]> {
  const customErrors: Record<string, string[]> = {};
  for (const error of validationErrors) {
    if (error.children.length >= 1) {
      for (const child of error.children) {
        customErrors[child.property] = Object.values(child.constraints);
      }
    } else {
      customErrors[error.property] = Object.values(error.constraints);
    }
  }
  return customErrors;
}
