import { Injectable } from '@nestjs/common';
import { S3UploadService } from '../s3-upload/s3-upload.service';
import { Constants } from './constants/video-encoding.constants';
import { spawn } from 'child_process';
import { PassThrough, Readable, Transform } from 'stream';
import pLimit from 'p-limit';
import ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class VideoEncodingService {
    constructor(private readonly s3Service: S3UploadService) {}

    async encodeVideo(videoBuffer: Buffer, bucketName: string, objectKey: string): Promise<void> {
        const readableStream = Readable.from([videoBuffer]);
        const resolutions = [360, 480, 720, 1080];
        const contentType = 'application/vnd.apple.mpegurl';
        const passThroughStreams: { resolution: number, stream: PassThrough }[] = resolutions.map(resolution => ({ resolution, stream: new PassThrough() }));

        const command = ffmpeg(readableStream);

        passThroughStreams.forEach(({ resolution, stream }) => {
            command
            .output(stream)
            .videoCodec('libx264')
            .size(`?x${resolution}`)
            .format('hls')
            .outputOptions([
                '-hls_time 10',
                '-hls_playlist_type vod',
                `-hls_segment_filename ${objectKey}_${resolution}p_%03d.ts`,
            ]);
        });

        command.run();

        const uploadPromises = passThroughStreams.map(async ({ resolution, stream }) => {
            const s3ObjectKey = `${objectKey}_${resolution}p.m3u8`;
            return this.s3Service.uploadFile(stream, bucketName, s3ObjectKey, contentType);
        });

        await Promise.all(uploadPromises);
    }

}
