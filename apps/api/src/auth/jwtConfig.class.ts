import { JwtOptionsFactory, JwtModuleOptions } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  createJwtOptions(): JwtModuleOptions {
    return {
        secret: process.env.APP_SECRET as string,
        signOptions: {
          expiresIn: '1d',
          algorithm: 'HS384',
        },
        verifyOptions: {
          algorithms: ['HS384'],
        },
    };
  }
}