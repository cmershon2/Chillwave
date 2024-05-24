import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateCreatorProfile {

    @ApiProperty({
        readOnly: true,
        required: false,
    })
    @IsString()
    @IsOptional()
    readonly bio?: string;
}