import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JWTAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../../../auth/guards/session-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles, User } from '@prisma/client';
import { AuthUser } from '../../../user/decorators/user.decorator';
import { CreateCreatorProfile } from '../dto/create-creator-profile.dto';
import { UpdateCreatorProfile } from '../dto/update-creator-profile.dto';
import { CreatorProfileInterceptor } from '../interceptors/profile.interceptor';
import { RequiredRoles } from '../../../auth/decorators/roles.decorators';
import { RolesGuard } from '../../../auth/guards/role.guard';

@ApiTags('Creator Profile')
@Controller('creator/:id/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // create profile
  @Post()
  @RequiredRoles(Roles.CREATOR, Roles.ADMIN)
  @UseGuards(SessionAuthGuard, JWTAuthGuard, RolesGuard)
  async create(
    @Param('id', new ParseIntPipe()) id: number,
    @AuthUser() user: User,
    @Body() data: CreateCreatorProfile,
  ) {
    return await this.profileService.createCreatorProfile(id, data, user);
  }

  // upload profile banner
  @Post('upload/banner-image')
  @RequiredRoles(Roles.CREATOR, Roles.ADMIN)
  @UseGuards(SessionAuthGuard, JWTAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('bannerImage'), CreatorProfileInterceptor)
  async uploadBannerImage(
    @Param('id', new ParseIntPipe()) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 6000000 }), //6 mb
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    bannerImage: Express.Multer.File,
  ) {
    return await this.profileService.uploadProfileBanner(id, bannerImage);
  }

  // get profile
  @Get()
  async get(@Param('id', new ParseIntPipe()) id: number) {
    return await this.profileService.getCreatorProfile(id);
  }

  // update profile
  @Patch()
  @RequiredRoles(Roles.CREATOR, Roles.ADMIN)
  @UseGuards(SessionAuthGuard, JWTAuthGuard, RolesGuard)
  @UseInterceptors(CreatorProfileInterceptor)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() update: UpdateCreatorProfile,
  ) {
    return await this.profileService.updateCreatorProfile(id, update);
  }

  // delete profile
  @Delete()
  @RequiredRoles(Roles.CREATOR, Roles.ADMIN)
  @UseGuards(SessionAuthGuard, JWTAuthGuard, RolesGuard)
  @UseInterceptors(CreatorProfileInterceptor)
  async delete(@Param('id', new ParseIntPipe()) id: number) {
    return await this.profileService.deleteCreatorProfile(id);
  }
}
