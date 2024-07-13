import { DeleteObjectCommand, GetObjectCommand, ObjectCannedACL, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { Injectable, Logger } from '@nestjs/common';
import { PassThrough, Readable } from 'stream';
import { S3FileUpload } from './dto/s3-file-upload.dto';

@Injectable()
export class S3ClientService {
    private s3Client: S3Client;
    private readonly logger = new Logger(S3ClientService.name);

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

    async uploadFile( data: S3FileUpload ): Promise<string> {
        const pass = new PassThrough();
        const params = {
            Bucket: data.bucketName,
            Key: data.filePath ? `${data.filePath}${data.objectKey}` : data.objectKey,
            Body: pass,
            ContentType: data.contentType,
            ACL: data.acl,
            CacheControl: data.cacheControl,
        };

        try {
            if (Buffer.isBuffer(data.file)) {
                pass.end(data.file);
            } else {
                data.file.pipe(pass);
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
            this.logger.log(`Successfully uploaded ${params.Key} to ${data.bucketName}`);
            return uploadResult.Location;
        } catch (err) {
            this.logger.error('Error uploading file to S3:', err);
            throw err;
        }
    }

    async deleteFile(bucketName: string, objectKey: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });

        try {
            await this.s3Client.send(command);
            this.logger.log(`Successfully deleted ${objectKey} from ${bucketName}`);
        } catch (err) {
            this.logger.error(`Error deleting file from S3: ${err}`, err);
            throw err;
        }
    }
}
