import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RequestService } from '../services/request.service';
import { AuthUser } from 'src/user/decorators/user.decorator';
import { User } from '@prisma/client';
import { UpdateCreatorRequest } from '../dto/update-creator-request.dto';
import { VerifyCreatorRequest } from '../dto/verify-creator-request.dto';

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
    async getRequest(@Param('id', new ParseIntPipe()) id: number) {
        return await this.requestService.get(id);
    }

    @Patch(':id')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async updateRequest(
        @Param('id', new ParseIntPipe()) id: number,
        @Body() updateCreatorRequest : UpdateCreatorRequest
    ) {
        return await this.requestService.update(id, updateCreatorRequest);
    }

    @Delete(':id')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async deleteRequest(@Param('id', new ParseIntPipe()) id: number) {
        return await this.requestService.delete(id);
    }

    @Post(':id/email/:emailId/verify')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    async verifyEmailRequest(
        @Param('id', new ParseIntPipe()) id: number,
        @Param('emailId') emailId: number,
        @Body() verifyCreatorRequest: VerifyCreatorRequest
    ) {
        return await this.requestService.verify(id, emailId, verifyCreatorRequest);
    }
}
