import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserUpdate } from '../dto/user-update.dto';
import { UserService } from '../services/user.service';
import { ApiTags } from '@nestjs/swagger';
import { RolesInterceptor } from '../interceptors/roles.interceptor';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthUser } from '../decorators/user.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':id')
    get(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
        return this.userService.findOne(id);
    }

    @Put(':id')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    @UseInterceptors(RolesInterceptor)
    update(
        @Param('id', new ParseIntPipe()) id: number,
        @Body() updatesUser: UserUpdate,
        @AuthUser() user: User,
    ): Promise<User> {
        return this.userService.update(id, updatesUser);
    }

    @Delete(':id')
    @UseGuards(SessionAuthGuard, JWTAuthGuard)
    @UseInterceptors(RolesInterceptor)
    delete(
        @Param('id', new ParseIntPipe()) id: number,
        @AuthUser() user: User,
    ) : Promise<User>{
        return this.userService.delete(id);
    }
}
