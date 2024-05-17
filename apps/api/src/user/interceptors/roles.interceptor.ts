import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { Roles, User } from '@prisma/client';

@Injectable()
export class RolesInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User; // Assuming user is stored in request.user after authentication

    // Check if user is admin
    const isAdmin = user.roles.includes(Roles.ADMIN);
    if (isAdmin) {
      return next.handle();
    }

    // Check ownership
    const userId = parseInt(request.params.id); // Assuming the entity ID is passed in the request params
    const userEntity = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userEntity) {
      throw new NotFoundException(
        `There isn't any user with identifier: ${userId}`,
      );
    }

    if (userEntity.id === user.id) {
      return next.handle();
    } else {
      throw new UnauthorizedException();
    }
  }
}
