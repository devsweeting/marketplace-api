import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Media } from '../entities';
import { MediaTypeEnum } from '../enums/media-type.enum';

const REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+(?:&|&#38;);v=))((?:\w|-|_){11})$/;

@ValidatorConstraint({ name: 'UrlFormatValidator', async: true })
@Injectable()
export class UrlFormatValidator implements ValidatorConstraintInterface {
  public validate(propertyValue: string, args: ValidationArguments): boolean {
    const object: Media = args.object as Media;
    return object.type === MediaTypeEnum.Youtube ? REGEX.test(propertyValue) : true;
  }

  public defaultMessage(args: ValidationArguments) {
    return `The ${args.property} format is not valid`;
  }
}
