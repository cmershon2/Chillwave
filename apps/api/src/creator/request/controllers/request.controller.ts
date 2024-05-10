import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';

@Controller('request')
export class RequestController {
    @Post()
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    request() {
    // Logic for creating a new creator request
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
