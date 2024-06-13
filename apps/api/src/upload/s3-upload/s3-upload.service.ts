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
    file: Buffer | PassThrough,
    bucketName: string,
    objectKey: string,
    filePath?: string,
    contentType?: string,
    acl?: string,
  ): Promise<string> {
    const pass = new PassThrough();
    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: pass,
    };

    if(contentType){
      params['ContentType'] = contentType;
    }

    if(filePath){
      params['Key'] = filePath + objectKey;
    }

    if(acl){
      params['ACL'] = acl;
    }

    try {
      if (Buffer.isBuffer(file)) {
        pass.end(file);
      } else {
        file.pipe(pass);
      }
      
      const uploadResult = await this.s3.upload(params).promise();
      return uploadResult.Location;
    } catch (err) {
      console.error('Error uploading file to S3:', err);
      throw err;
    }
  }
}