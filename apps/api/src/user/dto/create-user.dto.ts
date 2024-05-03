import { IsDefined, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { IsUserAlreadyExist } from "../validators/is-user-already-exist.validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDTO {

    @ApiProperty({
        example: 'gilfoyle@piedpiper.com',
        description: 'A unique email address. An email addres can only be used once.',
        required: true
    })
    @IsEmail()
    @IsNotEmpty()
    @IsDefined()
    @Validate(IsUserAlreadyExist)
    email: string;
    
    @ApiProperty({
        example: 'Gilf',
        description: 'The display name associated with a given user',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    @IsDefined()
    @MinLength(3, { message: 'Username is too short. Minimal length is $constraint1 characters', })
    @MaxLength(25, { message: 'Username is too long. Maximum length is $constraint1 characters',})
    displayName: string;

    @ApiProperty({
        required: true
    })
    @IsString()
    @IsNotEmpty()
    @IsDefined()
    @MinLength(8)
    password: string;
}