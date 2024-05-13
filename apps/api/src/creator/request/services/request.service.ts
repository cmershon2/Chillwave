import { Injectable } from '@nestjs/common';
import { EmailService } from '../../../email/email.service';

@Injectable()
export class RequestService {

    constructor(private readonly emailService: EmailService) {}
    
    async create(email: string) : Promise<void>{

        const mailOptions = {
            from: 'no-reply@flixify.io',
            to: email,
            subject: 'Flixify Creator Validation',
        };
      
        const context = {
            resetUrl: `https://flixify.io/1234`,
        };

        await this.emailService.sendMail(mailOptions, 'creator-validation', context);
    }
}
