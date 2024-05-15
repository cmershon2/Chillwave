import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailService } from '../../../email/email.service';
import { User, CreatorRequest } from '@prisma/client';
import { PrismaService } from '../../../persistence/prisma/prisma.service';

@Injectable()
export class RequestService {

    constructor(
        private readonly emailService: EmailService,
        private readonly prismaService: PrismaService
    ) {}
    
    async create(user: User) : Promise<CreatorRequest>{

        const existingRequest = await this.prismaService.creatorRequest.findUnique({where:{userId:user.id}});

        if(existingRequest) {
            throw new BadRequestException(`There is an existing creator request for user id: ${user.id}`)
        }

        const accountAge = Math.round((Date.now() - user.createdAt.getTime()) / (1000 * 3600 * 24));

        if(accountAge < 5) {
            throw new BadRequestException(`User must have an account that has existed for more than 5 days. Your account's age is only: ${accountAge}`)
        }

        const emailExpires = new Date(new Date().getTime()+(24*60*60*1000)); //1 day from now

        const newCreatorRequest = await this.prismaService.creatorRequest.create({
            data:{
                userId: user.id,
                accountAge: accountAge,
                emailVerification:{
                    create:{
                        expiresAt: emailExpires
                    }
                }
            },
            include:{
                emailVerification: true
            }
        });


        const mailOptions = {
            from: 'no-reply@flixify.io',
            to: user.email,
            subject: 'Flixify Creator Validation',
        };
      
        const context = {
            resetUrl: `https://flixify.io/creator-club/verify/${newCreatorRequest.emailVerification.verificationId}`,
        };

        await this.emailService.sendMail(mailOptions, 'creator-validation', context);

        return newCreatorRequest;
    }

    async get(id: number) : Promise<CreatorRequest>{
        const creatorRequest = await this.prismaService.creatorRequest.findUnique({
            where:{id: id},
            include:{ emailVerification: true }
        });

        if(!creatorRequest) {
            throw new NotFoundException()
        }

        return creatorRequest;
    }

    async update(user : User) : Promise<CreatorRequest> {

    }

    async delete(user : User) : Promise<void>{

    }
}
