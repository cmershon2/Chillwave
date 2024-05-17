import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmailService } from '../../../email/email.service';
import {
  User,
  CreatorRequest,
  CreatorRequestStatus,
  Roles,
} from '@prisma/client';
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import { UpdateCreatorRequest } from '../dto/update-creator-request.dto';
import { VerifyCreatorRequest } from '../dto/verify-creator-request.dto';

@Injectable()
export class RequestService {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(user: User): Promise<CreatorRequest> {
    const existingRequest = await this.prismaService.creatorRequest.findUnique({
      where: { userId: user.id },
    });

    if (existingRequest) {
      throw new BadRequestException(
        `There is an existing creator request for user id: ${user.id}`,
      );
    }

    const accountAge = Math.round(
      (Date.now() - user.createdAt.getTime()) / (1000 * 3600 * 24),
    );

    if (accountAge < 5) {
      throw new BadRequestException(
        `User must have an account that has existed for more than 5 days. Your account's age is only: ${accountAge}`,
      );
    }

    const emailExpires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //1 day from now

    const newCreatorRequest = await this.prismaService.creatorRequest.create({
      data: {
        userId: user.id,
        accountAge: accountAge,
        emailVerification: {
          create: {
            expiresAt: emailExpires,
          },
        },
      },
      include: {
        emailVerification: true,
      },
    });

    const mailOptions = {
      from: 'no-reply@flixify.io',
      to: user.email,
      subject: 'Flixify Creator Validation',
    };

    const context = {
      resetUrl: `https://flixify.io/creator-club/verify/${newCreatorRequest.emailVerification.verificationId}`,
    };

    await this.emailService.sendMail(
      mailOptions,
      'creator-validation',
      context,
    );

    return newCreatorRequest;
  }

  async get(id: number): Promise<CreatorRequest> {
    const creatorRequest = await this.prismaService.creatorRequest.findUnique({
      where: { id: id },
      include: { emailVerification: true },
    });

    if (!creatorRequest) {
      throw new NotFoundException();
    }

    return creatorRequest;
  }

  async update(
    id: number,
    update: UpdateCreatorRequest,
  ): Promise<CreatorRequest> {
    const creatorRequest = await this.prismaService.creatorRequest.findUnique({
      where: { id: id },
      include: { emailVerification: true },
    });

    if (!creatorRequest) {
      throw new NotFoundException();
    }

    const updatedRequest = await this.prismaService.creatorRequest.update({
      where: { id: id },
      data: update,
    });

    return updatedRequest;
  }

  async delete(id: number): Promise<void> {
    const creatorRequest = await this.prismaService.creatorRequest.findUnique({
      where: { id: id },
      include: { emailVerification: true },
    });

    if (!creatorRequest) {
      throw new NotFoundException();
    }

    await this.prismaService.creatorRequest.delete({
      where: { id: id },
    });

    return;
  }

  async verify(
    id: number,
    emailId: number,
    verifyCreatorRequest: VerifyCreatorRequest,
  ): Promise<CreatorRequest> {
    const creatorRequest = await this.prismaService.creatorRequest.findUnique({
      where: { id: id },
      include: { emailVerification: true },
    });

    if (!creatorRequest) {
      throw new NotFoundException();
    }

    if (
      creatorRequest.emailVerification.id != emailId ||
      creatorRequest.emailVerification.verificationId !=
        verifyCreatorRequest.token
    ) {
      throw new NotFoundException();
    }

    if (creatorRequest.status == 'APPROVED') {
      throw new BadRequestException('Request already approved');
    }

    if (creatorRequest.status == 'REJECTED') {
      throw new BadRequestException('Request already rejected');
    }

    const currentTime = new Date();

    if (
      creatorRequest.emailVerification.expiresAt.getTime() <
      currentTime.getTime()
    ) {
      throw new UnauthorizedException('Expired Email Verification Token');
    }

    // TODO verify account is in good standing - ie. no outstanding reports

    const updatedCreatorRequest =
      await this.prismaService.creatorRequest.update({
        where: { id: id },
        data: {
          approvedAt: currentTime,
          status: CreatorRequestStatus.APPROVED,
          emailVerification: {
            update: {
              data: {
                verified: true,
              },
            },
          },
        },
      });

    // update user roles after verification
    await this.prismaService.user.update({
      where: { id: updatedCreatorRequest.userId },
      data: {
        roles: {
          push: Roles.CREATOR,
        },
      },
    });

    return updatedCreatorRequest;
  }
}
