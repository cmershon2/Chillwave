import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

export const AuthUser = createParamDecorator(
    (data: keyof User, ctx: ExecutionContext) => {
      const user = ctx.switchToHttp().getRequest<Request>().user as User;
  
      return data ? user && user[data] : user;
    },
  );