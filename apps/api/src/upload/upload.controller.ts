import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueueService } from '../queue/queue.service';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(
        private readonly queueService: QueueService,
        private readonly uploadService: UploadService,
    ){}

    @Post('video')
    @UseInterceptors(FileInterceptor('video'))
    async uploadVideo(
        @UploadedFile() file: Express.Multer.File
    ){
        const fileName = uuidv4();
        await this.uploadService.uploadFile(file, fileName);

        const data = {
            key:fileName
        }

        await this.queueService.enqueueVideoUpload(data);
        return { message: 'Video upload queued' };
    }

}
