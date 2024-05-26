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
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import { Roles, User } from '@prisma/client';

@Injectable()
export class CreatorProfileInterceptor implements NestInterceptor {
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
    const creatorId = parseInt(request.params.id); // Assuming the entity ID is passed in the request params
    const creatorEntity = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creatorEntity) {
      throw new NotFoundException(
        `There is no creator profile for id: ${creatorId}`,
      );
    }

    if (creatorEntity.userId === user.id) {
      return next.handle();
    } else {
      throw new UnauthorizedException();
    }
  }
}
