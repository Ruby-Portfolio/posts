import { registerDecorator, ValidationOptions } from '@nestjs/class-validator';
import { CommonErrorMessage } from '../error/common.error.message';

export function IsId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isId',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message: CommonErrorMessage.ID_INVALID,
      },
      validator: {
        validate(value: any) {
          return typeof value === 'number' && value > 0;
        },
      },
    });
  };
}
