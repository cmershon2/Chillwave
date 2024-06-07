import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { PassThrough } from 'stream';

@Injectable()
export class S3UploadService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
        s3ForcePathStyle: false,
        endpoint: 'https://nyc3.digitaloceanspaces.com',
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
        },
    });
  }

  async uploadFile(
    file: Buffer,
    bucketName: string,
    objectKey: string,
    contentType: string,
  ): Promise<string> {
    const pass = new PassThrough();
    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: pass,
      ContentType: contentType,
    };

    try {
      pass.end(file);
      const uploadResult = await this.s3.upload(params).promise();
      return uploadResult.Location;
    } catch (err) {
      console.error('Error uploading file to S3:', err);
      throw err;
    }
  }
}