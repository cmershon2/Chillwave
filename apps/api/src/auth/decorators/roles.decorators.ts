import { SetMetadata } from '@nestjs/common';
import { Roles as RolesEnum } from '@prisma/client'; // Import the Roles enum from Prisma

export const RequiredRoles = (...roles: RolesEnum[]) =>
  SetMetadata('requiredRoles', roles);
