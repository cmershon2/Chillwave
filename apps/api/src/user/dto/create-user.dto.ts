import { IsDefined, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDTO {

    @IsEmail()
    @IsNotEmpty()
    @IsDefined()
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