import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
    constructor(
        @InjectQueue('{video-upload}') private readonly videoUploadQueue: Queue,
        @InjectQueue('{video-transcoding}') private readonly transcodingQueue: Queue,
        @InjectQueue('{video-content-filtering}') private readonly contentFilterQueue: Queue,
    ) {}

    async enqueueVideoUpload(videoData: object) {
        await this.videoUploadQueue.add('upload-video',videoData);
    }

    async enqueueContentFilter(data: object) {
        await this.contentFilterQueue.add('filter-video', data);
    }

    async enqueueTranscoding(data: object){
        await this.transcodingQueue.add('transcode-video', data);
    }
}
