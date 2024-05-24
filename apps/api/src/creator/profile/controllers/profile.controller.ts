import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JWTAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../../../auth/guards/session-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { AuthUser } from 'src/user/decorators/user.decorator';
import { CreateCreatorProfile } from '../dto/create-creator-profile.dto';
import { UpdateCreatorProfile } from '../dto/update-creator-profile.dto';

@ApiTags('Creator Profile')
@Controller('creator/:id/profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    // create profile
    @Post()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async create(
        @Param('id', new ParseIntPipe()) id: number,
        @AuthUser() user: User,
        @Body() data: CreateCreatorProfile
    ) {
        return await this.profileService.createCreatorProfile(id, data, user);
    }

    // upload profile banner
    @Post('upload/banner-image')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    @UseInterceptors(FileInterceptor('bannerImage'))
    async uploadBannerImage(
        @Param('id', new ParseIntPipe()) id: number,
        @UploadedFile(
            new ParseFilePipe({
                validators:[
                    new MaxFileSizeValidator({ maxSize: 6000000 }), //6 mb
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
                ]
            })
        ) bannerImage: Express.Multer.File
    ){
        return await this.profileService.uploadProfileBanner(id, bannerImage);
    }

    // get profile
    @Get()
    async get(
        @Param('id', new ParseIntPipe()) id: number
    ) {
        return await this.profileService.getCreatorProfile(id);
    }

    // update profile
    @Patch()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async update(
        @Param('id', new ParseIntPipe()) id: number,
        @Body() update : UpdateCreatorProfile
    ) {
        return await this.profileService.updateCreatorProfile(id, update);
    }

    // delete profile
    @Delete()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async delete(
        @Param('id', new ParseIntPipe()) id: number
    ){
        return await this.profileService.deleteCreatorProfile(id);
    }

}
