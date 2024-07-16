import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job, Queue } from "bullmq";
import { ContentFilterService } from "src/content-filter/content-filter.service";

@Injectable()
@Processor('{video-content-filtering}', 
    { 
        concurrency: 1, 
        lockDuration: 600000*3, 
        stalledInterval: 600000
    })
export class ContentFilteringProcessor extends WorkerHost {
    
    private readonly logger = new Logger(ContentFilteringProcessor.name);

    constructor(
        @InjectQueue('{video-content-filtering}') private readonly contentFilteringQueue: Queue,
        @InjectQueue('{video-transcoding}') private readonly transcodingQueue: Queue,
        private readonly contentFilterService: ContentFilterService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>) {

        try {
            // Run video through content filter
            const filterResult = await this.contentFilterService.detectExplicitVideoContent(job.data.key);

            if(filterResult.passed){
                return {
                    key: job.data.key,
                    passed: filterResult.passed
                };
            } else {
                // handle excessive explicit content
                // flag account & delete video

                throw 'Excessive explicit content found';
            }
        } catch (error) {
            // Handle errors
            console.error('Error processing video upload:', error);
            await job.moveToFailed(new Error(`Error processing video upload: ${error}`), job.token);
            throw error;
        }
    }

    @OnWorkerEvent('active')
    async onActive(job: Job){
        this.logger.log(`Job ${job.id} of type ${job.name} has been started.`)
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
        this.logger.log('Worker is ready');
    }
}