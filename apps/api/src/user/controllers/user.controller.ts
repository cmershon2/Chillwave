import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserUpdate } from '../dto/user-update.dto';
import { UserService } from '../services/user.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':id')
    get(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
        return this.userService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', new ParseIntPipe()) id: number,
        @Body() updatesUser: UserUpdate,
    ): Promise<User> {
        return this.userService.update(id, updatesUser);
    }

    @Delete(':id')
    delete(
        @Param('id', new ParseIntPipe()) id: number
    ) : Promise<User>{
        return this.userService.delete(id);
    }
}
