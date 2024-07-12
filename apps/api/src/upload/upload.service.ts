import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';

@Injectable()
export class UploadService {
    private s3: S3;

    constructor() {
        this.s3 = new S3({
            s3ForcePathStyle: false,
            endpoint: 'https://nyc3.digitaloceanspaces.com',
            region: process.env.S3_REGION,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
            },
        });
    }

    async managedVideoUpload(file: Express.Multer.File, fileName: string): Promise<ManagedUpload.SendData> {
        const uploadParams: S3.PutObjectRequest = {
            Bucket: 'chillwave-video-intake',
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
    
        return new Promise((resolve, reject) => {
            const managedUpload = this.s3.upload(uploadParams);
    
            managedUpload.on('httpUploadProgress', (progress) => {
                let completionCalculation = Math.round((progress.loaded/progress.total) * 100);
                console.log(`🎥 Progress: ${completionCalculation}% - ${progress.loaded}/${progress.total}`);
            });

            managedUpload.send((err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
}
