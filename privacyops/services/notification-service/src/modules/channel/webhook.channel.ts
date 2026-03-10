import { Injectable, Logger } from '@nestjs/common';
import { ChannelPayload, ChannelResult } from './channel-router.service';

@Injectable()
export class WebhookChannel {
  private readonly logger = new Logger(WebhookChannel.name);

  async send(payload: ChannelPayload): Promise<ChannelResult> {
    const url = payload.metadata?.webhookUrl as string;
    if (!url) return { success: false, error: 'No webhook URL provided' };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(payload.metadata?.headers as Record<string, string> || {}),
        },
        body: JSON.stringify({
          subject: payload.subject,
          body: payload.body,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`Webhook send failed: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  }
}
