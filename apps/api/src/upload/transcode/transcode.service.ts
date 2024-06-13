import { Injectable } from '@nestjs/common';
import { S3UploadService } from '../s3-upload/s3-upload.service';
import { v4 as uuidv4 } from 'uuid';
import { Constants } from './constants/transcode.constants';

@Injectable()
export class TranscodeService {

  constructor(
    private readonly s3UploadService: S3UploadService,
  ){}

  async transcodeVideo(videoData: any, chunkIndex: number, resolution: string) {
    const videoBuffer:Buffer = Buffer.from(videoData.buffer.data);
    const fileName = `${uuidv4()}`
    await this.s3UploadService.uploadFile(videoBuffer, 'chillwave-video-intake', fileName, '', videoData.mimetype);

    const functionName = `transcode/${resolution}`;
    const functionUrl = `${Constants.SERVERLESS_URL}/${Constants.SERVERLESS_NAMESPACE}/${functionName}`;
    const data = JSON.stringify({ jobId: fileName});

    const response = await fetch(
      functionUrl,
      {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Authorization": process.env.DIGITAL_OCEAN_API_TOKEN
        },
        body: data
      }
    );

    // Handle the response as needed
    console.log(response);

    return response;
  }
}