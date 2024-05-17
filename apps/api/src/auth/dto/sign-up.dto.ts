import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Validate,
  MaxLength,
} from 'class-validator';

import { IsUserAlreadyExist } from '../../user/validators/is-user-already-exist.validator';

export class SignUp {
  @IsDefined()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'Username is too short. Minimal length is $constraint1 characters',
  })
  @MaxLength(25, {
    message: 'Username is too long. Maximum length is $constraint1 characters',
  })
  readonly displayName: string;

  @IsDefined()
  @IsEmail()
  @Validate(IsUserAlreadyExist)
  readonly email: string;

  @IsDefined()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}
