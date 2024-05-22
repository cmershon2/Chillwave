import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JWTAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../../../auth/guards/session-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Creator Profile')
@Controller('creator/:id/profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    // create profile
    @Post()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async create(
        @Param('id', new ParseIntPipe()) id: number
    ) {
        
    }

    // upload profile banner
    @Post('upload/banner-image')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    @UseInterceptors(FileInterceptor('bannerImage'))
    async uploadBannerImage(
        @Param('id', new ParseIntPipe()) id: number,
        @UploadedFile() bannerImage: Express.Multer.File
    ){
        return await this.profileService.uploadProfileBanner(bannerImage);
    }

    // get profile
    @Get()
    async get(
        @Param('id', new ParseIntPipe()) id: number
    ) {

    }

    // update profile
    @Patch()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async update(
        @Param('id', new ParseIntPipe()) id: number
    ) {

    }

    // delete profile
    @Delete()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async delete(
        @Param('id', new ParseIntPipe()) id: number
    ){

    }

}
