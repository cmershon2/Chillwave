import { Injectable } from '@nestjs/common';
import S3 from 'aws-sdk/clients/s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageUploadService {
    private s3: S3;

    constructor() {
        this.s3 = new S3({
            s3ForcePathStyle: false,
            endpoint: "https://nyc3.digitaloceanspaces.com",
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
            }
        });
    }
    
    async uploadImage(
        file: Express.Multer.File,
        bucket: string,
        folder: string,
        resizeWidth?: number
    ): Promise<string> {
        const filename = `${folder}/${uuidv4()}.jpg`;

        // Resize the image if a width is provided
        let resizedBuffer: Buffer;
        if (resizeWidth) {
            resizedBuffer = await sharp(file.buffer)
            .resize(resizeWidth)
            .jpeg()
            .toBuffer();
        } else {
            resizedBuffer = file.buffer;
        }

        // Upload the image to S3
        const params = {
            Bucket: bucket,
            Key: filename,
            Body: resizedBuffer,
            ContentType: 'image/jpeg',
        };

        await this.s3.upload(params).promise();

        return filename;
    }
}
