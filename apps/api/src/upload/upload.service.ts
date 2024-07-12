import { Injectable } from '@nestjs/common';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { S3clientService } from 'src/s3client/s3client.service';

@Injectable()
export class UploadService {

    constructor(
        private readonly s3Client: S3clientService,
    ) {}

    async managedVideoUpload(file: Express.Multer.File, fileName: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const managedUpload = await this.s3Client.uploadFile(file.buffer, 'chillwave-video-intake', fileName, '', file.mimetype);
                resolve(managedUpload)
            } catch (error) {
                console.error(error);
                reject(`Failed to upload file`)
            }
        });
    }
}
