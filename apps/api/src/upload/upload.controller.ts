import { Controller, Get, Post } from '@nestjs/common';
import { ContentFilterService } from './content-filter/content-filter.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly contentFilterService: ContentFilterService){}

    @Get('test/video')
    uploadVideo(){
        return this.contentFilterService.detectExplicitVideoContent('https://chillwave.nyc3.cdn.digitaloceanspaces.com/models/video.webm');
    }
}
