import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelPayload, ChannelResult } from './channel-router.service';

@Injectable()
export class SlackChannel {
  private readonly logger = new Logger(SlackChannel.name);

  constructor(private configService: ConfigService) {}

  async send(payload: ChannelPayload): Promise<ChannelResult> {
    const webhookUrl = this.configService.get<string>('slack.webhookUrl');
    if (!webhookUrl) return { success: false, error: 'Slack webhook URL not configured' };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*${payload.subject}*\n${payload.body}`,
          channel: payload.recipient || undefined,
        }),
      });

      if (!response.ok) throw new Error(`Slack API returned ${response.status}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`Slack send failed: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  }
}
