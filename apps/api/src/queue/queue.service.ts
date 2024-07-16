import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { FlowProducer, Queue } from 'bullmq';

@Injectable()
export class QueueService {
    constructor(
        @InjectQueue('{video-transcoding}') private readonly transcodingQueue: Queue,
        @InjectQueue('{video-content-filtering}') private readonly contentFilterQueue: Queue,
        @InjectFlowProducer('{video-processing-flow}') private readonly processVideoFlow : FlowProducer,
    ) {}

    async processVideo(data: object){
        const flow = await this.processVideoFlow.add({
            name: 'process-video',
            queueName: '{process-video}',
            data,
            children: [
                {
                    name: 'transcode-video',
                    data,
                    queueName: '{video-transcoding}',
                    children: [
                        {
                            name: 'filter-video',
                            data,
                            queueName: '{video-content-filtering}',
                        },
                    ],
                },
            ],
        });

        return flow.job.id;
    }

    async enqueueContentFilter(data: object) {
        await this.contentFilterQueue.add('filter-video', data);
    }

    async enqueueTranscoding(data: object){
        await this.transcodingQueue.add('transcode-video', data);
    }
}
