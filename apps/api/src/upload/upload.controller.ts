import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueueService } from '../queue/queue.service';
import { v4 as uuidv4 } from 'uuid';
import { S3UploadService } from './s3-upload/s3-upload.service';
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
        const data = {
            key: fileName
        }

        await this.uploadService.managedVideoUpload(file, fileName);
        await this.queueService.enqueueVideoUpload(data);
        return { 
            message: 'Video upload queued',
            data: {
                key: fileName
            }
        };
    }

    @Post('video/:id/retry')
    async retryVideoProcess(
        @Param('id') id: string
    ){
        const data = {
            key: id
        }

        await this.queueService.enqueueVideoUpload(data);
        return { 
            message: 'Video upload queued',
            data: {
                key: id
            }
        };
    }

    @Post('video/:id/retry-transcoding')
    async retryVideoTranscoding(
        @Param('id') id: string
    ){
        const data = {
            key: id
        }

        await this.queueService.enqueueTranscoding(data);
        return { 
            message: 'Video transcode queued',
            data: {
                key: id
            }
        };
    }
}
