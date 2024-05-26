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
import { User } from '@prisma/client';

@Injectable()
export class IsCreatorRequestOwner implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User; // Assuming user is stored in request.user after authentication

    // Check ownership
    const requestId = parseInt(request.params.id); // Assuming the entity ID is passed in the request params
    const requestEntity = await this.prisma.creatorRequest.findUnique({
      where: { id: requestId },
    });

    if (!requestEntity) {
      throw new NotFoundException();
    }

    if (requestEntity.userId === user.id) {
      return next.handle();
    } else {
      throw new UnauthorizedException();
    }
  }
}
