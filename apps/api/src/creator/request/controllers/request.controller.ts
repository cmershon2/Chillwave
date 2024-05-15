import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RequestService } from '../services/request.service';
import { AuthUser } from 'src/user/decorators/user.decorator';
import { User } from '@prisma/client';

@ApiTags('Creator')
@Controller('creator/request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @Post()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async request(
        @AuthUser() user: User,
    ) {
        return await this.requestService.create(user);
    }

    @Get(':id')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    getRequest(@Param('id', new ParseIntPipe()) id: number) {
    // Logic for getting an existing creator request
    }

    @Patch(':id')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    updateRequest(@Param('id', new ParseIntPipe()) id: number) {
    // Logic for updating (approving/rejecting) a creator request
    }

    @Delete(':id')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    deleteRequest(@Param('id', new ParseIntPipe()) id: number) {
    // Logic for deleting a creator request
    }
}
