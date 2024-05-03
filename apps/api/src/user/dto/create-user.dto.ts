import { IsDefined, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { IsUserAlreadyExist } from "../validators/is-user-already-exist.validator";

export class CreateUserDTO {

    @IsEmail()
    @IsNotEmpty()
    @IsDefined()
    @Validate(IsUserAlreadyExist)
    email: string;
    
    @IsString()
    @IsNotEmpty()
    @IsDefined()
    @MinLength(3, { message: 'Username is too short. Minimal length is $constraint1 characters', })
    @MaxLength(25, { message: 'Username is too long. Maximum length is $constraint1 characters',})
    displayName: string;

    @IsString()
    @IsNotEmpty()
    @IsDefined()
    @MinLength(8)
    password: string;
}