import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({
    s3ForcePathStyle: false,
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
    },
});

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File, fileName: string): Promise<string> {

    const uploadId = await this.createMultipartUpload(fileName, file.mimetype);

    try {
      const parts = await this.uploadParts(uploadId, file, fileName);
      await this.completeMultipartUpload(uploadId, fileName, parts);
      return `${fileName}`;
    } catch (error) {
      await this.abortMultipartUpload(uploadId, fileName);
      throw new Error('Failed to upload file to S3');
    }
  }

  private async createMultipartUpload(fileName: string, contentType: string): Promise<string> {
    const params = {
      Bucket: 'chillwave-video-intake',
      Key: fileName,
      ContentType: contentType,
    };
    const { UploadId } = await s3.createMultipartUpload(params).promise();
    return UploadId;
  }

  private async uploadParts(uploadId: string, file: Express.Multer.File, fileName: string) {
    const partSize = 5 * 1024 * 1024; // 5 MB
    const parts: any[] = [];
    let partNumber = 1;
    let start = 0;

    while (start < file.buffer.length) {
      const end = Math.min(start + partSize, file.buffer.length);
      const partParams = {
        Body: file.buffer.subarray(start, end),
        Bucket: 'chillwave-video-intake',
        Key: fileName,
        PartNumber: partNumber,
        UploadId: uploadId,
      };
      const { ETag } = await s3.uploadPart(partParams).promise();
      parts.push({ ETag, PartNumber: partNumber });
      partNumber += 1;
      start = end;
    }

    return parts;
  }

  private async completeMultipartUpload(uploadId: string, fileName: string, parts: any[]) {
    const params = {
      Bucket: 'chillwave-video-intake',
      Key: fileName,
      MultipartUpload: { Parts: parts },
      UploadId: uploadId,
    };
    await s3.completeMultipartUpload(params).promise();
  }

  private async abortMultipartUpload(uploadId: string, fileName: string) {
    const params = {
      Bucket: 'chillwave-video-intake',
      Key: fileName,
      UploadId: uploadId,
    };
    await s3.abortMultipartUpload(params).promise();
  }
}
