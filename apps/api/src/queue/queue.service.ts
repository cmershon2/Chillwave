import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
    constructor(@InjectQueue('{video-upload}') private readonly videoUploadQueue: Queue) {}

    async enqueueVideoUpload(videoData: any) {
        await this.videoUploadQueue.add(videoData);
    }
}
