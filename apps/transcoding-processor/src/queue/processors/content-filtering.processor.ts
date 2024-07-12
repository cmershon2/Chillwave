import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job, Queue } from "bullmq";

@Injectable()
@Processor('{video-content-filtering}')
export class ContentFilteringProcessor extends WorkerHost {

    constructor(
        @InjectQueue('{video-content-filtering}') private readonly contentFilteringQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<any, any, string>) {
        
    }

    @OnWorkerEvent('completed')
    async onCompleted(job: Job, result: any) {
        console.log(`Job ${job.id} of type ${job.name} has been completed.`);
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job, error: any) {
        console.error(`Job ${job.id} of type ${job.name} has failed. Error: ${error}`);
    }

    @OnWorkerEvent('ready')
    async onReady() {
        console.log('Starting Content-Filtering Worker...');
        try {
        const counts = await this.contentFilteringQueue.getJobCounts();
        console.log('Queue Connected:', counts);
        } catch (error) {
        console.error('Error Connecting to Queue:', error);
        }
        console.log('Worker is ready');
    }
}