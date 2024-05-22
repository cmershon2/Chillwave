import { Injectable } from '@nestjs/common';
import { ImageUploadService } from '../../../image/image.service';
import { PrismaService } from '../../../persistence/prisma/prisma.service';

@Injectable()
export class ProfileService {
    constructor(
        private readonly imageUploadService: ImageUploadService,
        private readonly prismaService: PrismaService,
    ) {}

    async uploadProfileBanner(bannerImage: Express.Multer.File) {
        
        const imageUpload = await this.imageUploadService.uploadImage(bannerImage, "chillwave", "creators/banner-images", 1200);

        return imageUpload;
    }
}
