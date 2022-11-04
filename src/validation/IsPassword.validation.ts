import { registerDecorator, ValidationOptions } from '@nestjs/class-validator';
import { PostMessage } from '../domain/post/post.message';

export function IsPassword(
  passwordLengthOption?: PasswordLengthOption,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNumberContains',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message: PostMessage.PASSWORD,
      },
      validator: {
        validate(value: any) {
          const { min, max } = passwordLengthOption;
          const regex = /\d/;

          return (
            typeof value === 'string' &&
            value.length >= min &&
            value.length <= max &&
            regex.test(value)
          );
        },
      },
    });
  };
}

export class PasswordLengthOption {
  min: number = 1;
  max: number = 150;
}
