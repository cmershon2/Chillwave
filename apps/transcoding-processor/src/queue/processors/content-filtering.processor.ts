import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job, Queue } from "bullmq";

@Injectable()
@Processor('{video-content-filtering}')
export class ContentFilteringProcessor extends WorkerHost {
    
    private readonly logger = new Logger(ContentFilteringProcessor.name);

    constructor(
        @InjectQueue('{video-content-filtering}') private readonly contentFilteringQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<any, any, string>) {
        
    }

    @OnWorkerEvent('completed')
    async onCompleted(job: Job, result: any) {
        this.logger.log(`Job ${job.id} of type ${job.name} has been completed.`);
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job, error: any) {
        this.logger.error(`Job ${job.id} of type ${job.name} has failed. Error: ${error}`);
    }

    @OnWorkerEvent('ready')
    async onReady() {
        this.logger.log('Starting Worker...');
        try {
            await this.contentFilteringQueue.getJobCounts();
            this.logger.log('Successfully Connected to Queue');
        } catch (error) {
            this.logger.error('Error Connecting to Queue:', error);
        }
        console.log('Worker is ready');
    }
}