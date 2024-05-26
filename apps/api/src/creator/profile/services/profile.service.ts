import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageUploadService } from '../../../image/image.service';
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import { CreateCreatorProfile } from '../dto/create-creator-profile.dto';
import { CreatorProfile, User } from '@prisma/client';
import { UpdateCreatorProfile } from '../dto/update-creator-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly imageUploadService: ImageUploadService,
    private readonly prismaService: PrismaService,
  ) {}

  async createCreatorProfile(
    creatorId: number,
    data: CreateCreatorProfile,
    user: User,
  ): Promise<CreatorProfile> {
    const creatorProfile = await this.prismaService.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (creatorProfile) {
      throw new BadRequestException(
        `There is an existing creator profile for id: ${creatorId}`,
      );
    }

    const createNewCreatorProfile =
      await this.prismaService.creatorProfile.create({
        data: {
          userId: user.id,
          bio: data.bio,
        },
        include: {
          user: {
            select: {
              displayName: true,
              userProfile: {
                select: {
                  avatar: true,
                },
              },
            },
          },
        },
      });

    return createNewCreatorProfile;
  }

  async uploadProfileBanner(
    creatorId: number,
    bannerImage: Express.Multer.File,
  ): Promise<CreatorProfile> {
    const creatorProfile = await this.prismaService.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creatorProfile) {
      throw new NotFoundException(
        `There is no creator profile for id: ${creatorId}`,
      );
    }

    const imageUpload = await this.imageUploadService.uploadImage(
      bannerImage,
      'chillwave',
      `creators/${creatorId}/banner-images`,
      2560,
      80,
    );

    const updateCreatorProfile = await this.prismaService.creatorProfile.update(
      {
        where: { id: creatorId },
        data: { bannerImage: imageUpload },
        include: {
          user: {
            select: {
              displayName: true,
              userProfile: {
                select: {
                  avatar: true,
                },
              },
            },
          },
        },
      },
    );

    return updateCreatorProfile;
  }

  async getCreatorProfile(creatorId: number): Promise<CreatorProfile> {
    const creatorProfile = await this.prismaService.creatorProfile.findUnique({
      where: { id: creatorId },
      include: {
        user: {
          select: {
            displayName: true,
            userProfile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!creatorProfile) {
      throw new NotFoundException(
        `There is no creator profile for id: ${creatorId}`,
      );
    }

    return creatorProfile;
  }

  async updateCreatorProfile(
    creatorId: number,
    update: UpdateCreatorProfile,
  ): Promise<CreatorProfile> {
    const creatorProfile = await this.prismaService.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creatorProfile) {
      throw new NotFoundException(
        `There is no creator profile for id: ${creatorId}`,
      );
    }

    const updatedCreatorProfile =
      await this.prismaService.creatorProfile.update({
        where: { id: creatorId },
        data: update,
        include: {
          user: {
            select: {
              displayName: true,
              userProfile: {
                select: {
                  avatar: true,
                },
              },
            },
          },
        },
      });

    return updatedCreatorProfile;
  }

  async deleteCreatorProfile(creatorId: number): Promise<void> {
    const creatorProfile = await this.prismaService.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creatorProfile) {
      throw new NotFoundException(
        `There is no creator profile for id: ${creatorId}`,
      );
    }

    await this.prismaService.creatorProfile.delete({
      where: { id: creatorId },
    });

    return;
  }
}
