import { Injectable, Logger } from '@nestjs/common';
import { ChannelPayload, ChannelResult } from './channel-router.service';

@Injectable()
export class InAppChannel {
  private readonly logger = new Logger(InAppChannel.name);

  async send(payload: ChannelPayload): Promise<ChannelResult> {
    // In-app notifications are stored in DB; the send() is a no-op since
    // the notification record itself serves as the in-app notification
    this.logger.debug(`In-app notification queued for ${payload.recipient}`);
    return { success: true, messageId: 'in-app' };
  }
}
