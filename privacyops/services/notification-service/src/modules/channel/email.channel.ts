import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ChannelPayload, ChannelResult } from './channel-router.service';

@Injectable()
export class EmailChannel {
  private readonly logger = new Logger(EmailChannel.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('smtp.host'),
      port: this.configService.get('smtp.port'),
      secure: this.configService.get('smtp.secure'),
      auth: {
        user: this.configService.get('smtp.user'),
        pass: this.configService.get('smtp.pass'),
      },
    });
  }

  async send(payload: ChannelPayload): Promise<ChannelResult> {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('smtp.from'),
        to: payload.recipient,
        subject: payload.subject,
        html: payload.body,
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      this.logger.error(`Email send failed: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  }
}
