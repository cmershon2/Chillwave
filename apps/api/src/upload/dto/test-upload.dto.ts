import { IsDefined, IsNotEmpty, IsUrl } from "class-validator";

export class TestUpload {
    @IsUrl()
    @IsNotEmpty()
    @IsDefined()
    readonly videoPath: string;
}