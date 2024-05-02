import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DiscordStrategy } from './utils/DiscordStrategy';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '1h' }, // Adjust expiration as needed
    }),
  ],
  controllers: [AuthController],
  providers: [DiscordStrategy, AuthService]
})
export class AuthModule {}
