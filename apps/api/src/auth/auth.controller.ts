import { Controller, Get, UseGuards } from '@nestjs/common';
import { DiscordAuthGuard } from './utils/Guards';

@Controller('auth')
export class AuthController {

    // auth/discord/redirect
    @Get('discord/login')
    @UseGuards(DiscordAuthGuard)
    handleDiscordLogin(){
        return {msg: 'Discord Authentication'}
    }

    // auth/discord/redirect
    @Get('discord/redirect')
    @UseGuards(DiscordAuthGuard)
    handleDiscordRedirect(){
        return {msg: 'OK'}
    }
}
