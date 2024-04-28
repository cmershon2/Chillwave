import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    // auth/discord/redirect
    @Get('discord/login')
    handleDiscordLogin(){
        return {msg: 'Discord Authentication'}
    }

    // auth/discord/redirect
    @Get('discord/redirect')
    handleDiscordRedirect(){
        return {msg: 'OK'}
    }
}
