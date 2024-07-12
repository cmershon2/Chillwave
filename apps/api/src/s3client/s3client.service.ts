import { GetObjectCommand, ObjectCannedACL, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class S3clientService implements OnModuleInit {
    private s3Client: S3Client;
    private readonly logger = new Logger(S3clientService.name);

    onModuleInit() {
        const s3Config: S3ClientConfig = {
            forcePathStyle: false,
            endpoint: 'https://nyc3.digitaloceanspaces.com',
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
            },
            requestHandler: new NodeHttpHandler({
                connectionTimeout: 300000, // timeout for establishing a connection
                socketTimeout: 300000, // timeout for socket inactivity
            }) as unknown as any,
        };

        this.s3Client = new S3Client(s3Config);
    }

    getS3Client(): S3Client {
        return this.s3Client;
    }

    async getVideoStream(bucket: string, key: string): Promise<Readable> {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        try {
            const response = await this.s3Client.send(command);
            if (response.Body instanceof Readable) {
                this.logger.log(`Successfully retrieved stream for ${key} from ${bucket}`);
                return response.Body as Readable;
            } else {
                throw new Error('Response body is not a readable stream');
            }
        } catch (error) {
            this.logger.error(`Error getting object from S3: ${error}`, error);
            throw error;
        }
    }

    async uploadFile(
        file: Buffer | PassThrough,
        bucketName: string,
        objectKey: string,
        filePath?: string,
        contentType?: string,
        acl?: ObjectCannedACL,
    ): Promise<string> {
        const pass = new PassThrough();
        const params = {
            Bucket: bucketName,
            Key: filePath ? `${filePath}${objectKey}` : objectKey,
            Body: pass,
            ContentType: contentType,
            ACL: acl,
        };

        try {
            if (Buffer.isBuffer(file)) {
                pass.end(file);
            } else {
                file.pipe(pass);
            }

            const upload = new Upload({
                client: this.s3Client,
                params,
            });

            upload.on('httpUploadProgress', (progress) => {
                let completionCalculation = Math.round((progress.loaded/progress.total) * 100);
                console.log(`Upload Progress: ${completionCalculation}% - ${progress.loaded}/${progress.total}`);
            });

            const uploadResult = await upload.done();
            this.logger.log(`Successfully uploaded ${params.Key} to ${bucketName}`);
            return uploadResult.Location;
        } catch (err) {
            this.logger.error('Error uploading file to S3:', err);
            throw err;
        }
    }
}