import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const isEmailValid = (email) => {
  // eslint-disable-next-line
  const regex = /^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

@ValidatorConstraint({ name: 'EmailValidator', async: false })
export class EmailValidator implements ValidatorConstraintInterface {
  public validate(propertyValue: string) {
    return isEmailValid(propertyValue);
  }

  public defaultMessage(args: ValidationArguments) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `"${args.property}" must be valid`;
  }
}
