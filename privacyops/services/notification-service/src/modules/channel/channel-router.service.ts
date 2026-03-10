import { Injectable, Logger } from '@nestjs/common';
import { EmailChannel } from './email.channel';
import { SlackChannel } from './slack.channel';
import { WebhookChannel } from './webhook.channel';
import { InAppChannel } from './in-app.channel';

export interface ChannelPayload {
  recipient: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class ChannelRouter {
  private readonly logger = new Logger(ChannelRouter.name);

  constructor(
    private email: EmailChannel,
    private slack: SlackChannel,
    private webhook: WebhookChannel,
    private inApp: InAppChannel,
  ) {}

  async send(channel: string, payload: ChannelPayload): Promise<ChannelResult> {
    switch (channel) {
      case 'email': return this.email.send(payload);
      case 'slack': return this.slack.send(payload);
      case 'webhook': return this.webhook.send(payload);
      case 'in_app': return this.inApp.send(payload);
      default:
        this.logger.warn(`Unknown channel: ${channel}`);
        return { success: false, error: `Unknown channel: ${channel}` };
    }
  }
}
