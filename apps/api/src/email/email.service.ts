import { Injectable } from '@nestjs/common';
import handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
         user: process.env.SMTP_USERNAME,
         pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendMail(options: nodemailer.SendMailOptions, template: string, context: any): Promise<void> {
    const templatePath = `${process.cwd()}/emailTemplates/${template}.hbs`;
    const source = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(source);
    const htmlToSend = compiledTemplate(context);

    const mailOptions: nodemailer.SendMailOptions = {
      ...options,
      html: htmlToSend,
    };

    await this.transporter.sendMail(mailOptions);
  }
}