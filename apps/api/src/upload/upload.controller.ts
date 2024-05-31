import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContentFilterService } from './content-filter/content-filter.service';
import { TestUpload } from './dto/test-upload.dto';

@Controller('upload')
export class UploadController {
    constructor(private readonly contentFilterService: ContentFilterService){}

    @Post('test/v1/video')
    uploadVideo(
        @Body() testUpload: TestUpload
    ){
        return this.contentFilterService.detectExplicitVideoContent(testUpload.videoPath);
    }

}
