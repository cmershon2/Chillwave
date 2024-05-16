import { ApiProperty } from "@nestjs/swagger";
import { CreatorRequestStatus } from "@prisma/client";
import { IsDate, IsEnum, IsNumber, IsOptional, IsString, } from "class-validator";

export class UpdateCreatorRequest {

    @ApiProperty({
        readOnly: true,
        required: false
    })
    @IsDate()
    @IsOptional()
    readonly rejectedAt: Date;

    @ApiProperty({
        readOnly: true,
        required: false
    })
    @IsDate()
    @IsOptional()
    readonly approvedAt: Date;

    @ApiProperty({
        readOnly: true,
        required: false
    })
    @IsString()
    @IsOptional()
    readonly reason: string;

    @ApiProperty({
        readOnly: true,
        required: false
    })
    @IsNumber()
    @IsOptional()
    readonly accountAge: number;

    @ApiProperty({
        readOnly: true,
        required: false,
        enum: CreatorRequestStatus
    })
    @IsEnum(CreatorRequestStatus)
    @IsOptional()
    readonly status: CreatorRequestStatus;
}