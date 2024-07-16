import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueueService } from '../queue/queue.service';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';
import { S3clientService } from '../s3client/s3client.service';

@Controller('upload')
export class UploadController {
    constructor(
        private readonly queueService: QueueService,
        private readonly uploadService: UploadService,
        private readonly s3Client: S3clientService,
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

        await this.s3Client.uploadFile(file.buffer, 'chillwave-video-intake', fileName, '')
        const processVideo = await this.queueService.processVideo(data);
        
        return { 
            message: 'Video upload queued',
            data: {
                key: fileName,
                job: processVideo,
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

        const processVideo = await this.queueService.processVideo(data);
        return { 
            message: 'Video upload queued',
            data: {
                key: id,
                job: processVideo,
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
