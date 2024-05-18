import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../../../auth/guards/session-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Creator Profile')
@Controller('creator/:id/profile')
export class ProfileController {
    // create profile
    @Post()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async create(
        @Param('id', new ParseIntPipe()) id: number
    ) {
        
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
