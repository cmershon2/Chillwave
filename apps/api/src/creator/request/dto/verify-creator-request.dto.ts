import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class VerifyCreatorRequest {
  @ApiProperty({
    readOnly: true,
    required: true,
  })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  readonly token: string;
}
