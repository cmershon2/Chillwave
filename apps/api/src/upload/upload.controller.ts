import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueueService } from '../queue/queue.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly queueService: QueueService){}

    @Post('video')
    @UseInterceptors(FileInterceptor('video'))
    async uploadVideo(
        @UploadedFile() file: Express.Multer.File
    ){
        await this.queueService.enqueueVideoUpload(file);
        return { message: 'Video upload queued' };
    }

}
