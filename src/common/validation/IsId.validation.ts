import { CommonErrorMessage } from '../error/common.error.message';
import { registerDecorator } from 'class-validator';

export function IsId() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isId',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: CommonErrorMessage.ID_INVALID,
      },
      validator: {
        validate(value: any) {
          if (!value && typeof value !== 'number') return true;
          return !isNaN(value) && value > 0;
        },
      },
    });
  };
}
