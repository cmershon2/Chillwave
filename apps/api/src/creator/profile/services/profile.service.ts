import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ImageUploadService } from '../../../image/image.service';
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import { CreateCreatorProfile } from '../dto/create-creator-profile.dto';
import { User } from '@prisma/client';

@Injectable()
export class ProfileService {
    constructor(
        private readonly imageUploadService: ImageUploadService,
        private readonly prismaService: PrismaService,
    ) {}

    async createCreatorProfile(creatorId: number, data: CreateCreatorProfile, user: User){
        const creatorProfile = await this.prismaService.creatorProfile.findUnique({
            where: { id: creatorId },
        });
      
        if (creatorProfile) {
            throw new BadRequestException(
                `There is an existing creator profile for id: ${creatorId}`,
            );
        }

        const createNewCreatorProfile = await this.prismaService.creatorProfile.create({
            data: {
                userId: user.id,
                bio: data.bio
            }
        })

        return createNewCreatorProfile;
    }

    async uploadProfileBanner(creatorId: number, bannerImage: Express.Multer.File) {
        const creatorProfile = await this.prismaService.creatorProfile.findUnique({
            where: { id: creatorId },
        });
      
        if (!creatorProfile) {
            throw new NotFoundException(
                `There is an no creator profile for id: ${creatorId}`,
            );
        }

        const imageUpload = await this.imageUploadService.uploadImage(bannerImage, "chillwave", `creators/${creatorId}/banner-images`, 2560, 80);

        const updateCreatorProfile = await this.prismaService.creatorProfile.update({
            where:{ id: creatorId},
            data: { bannerImage: imageUpload }
        })  

        return updateCreatorProfile;
    }
}
