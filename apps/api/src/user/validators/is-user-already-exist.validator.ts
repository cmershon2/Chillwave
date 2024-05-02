import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from 'src/persistence/prisma/prisma.service';


@ValidatorConstraint({ name: 'isUserAlreadyExist', async: true })
@Injectable()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  
  constructor( private readonly prismaService: PrismaService) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({ where:{ email } });

    return user === null || user === undefined;
  }

  defaultMessage(): string {
    return 'The email «$value» is already register.';
  }
}