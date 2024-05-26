import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageUploadService {
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

  async uploadImage(
    file: Express.Multer.File,
    bucket: string,
    folder: string,
    resizeWidth?: number,
    quality?: number,
  ): Promise<string> {
    const filename = `${folder}/${uuidv4()}.jpg`;

    let resizedBuffer: Buffer;
    let resizeQuality = 100;

    if (quality && quality >= 1 && quality <= 100) {
      resizeQuality = quality;
    }

    // Resize the image if a width is provided & keep aspect ratio
    if (resizeWidth) {
      resizedBuffer = await sharp(file.buffer)
        .resize({
          fit: sharp.fit.contain,
          width: resizeWidth,
        })
        .jpeg({ quality: resizeQuality })
        .toBuffer();
    } else {
      resizedBuffer = await sharp(file.buffer)
        .jpeg({ quality: resizeQuality })
        .toBuffer();
    }

    // Upload the image to S3
    const params = {
      Bucket: bucket,
      Key: filename,
      Body: resizedBuffer,
      ACL: 'public-read',
      ContentType: 'image/jpeg',
      CacheControl: 'max-age=31536000',
    };

    await this.s3.upload(params).promise();

    return filename;
  }
}
