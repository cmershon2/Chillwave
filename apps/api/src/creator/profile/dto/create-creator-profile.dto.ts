import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateCreatorProfile {

    @ApiProperty({
        readOnly: true,
        required: false,
    })
    @IsString()
    @IsOptional()
    readonly bio?: string;
}