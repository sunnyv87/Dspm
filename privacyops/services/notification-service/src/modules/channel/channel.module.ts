import { Module, Global } from '@nestjs/common';
import { EmailChannel } from './email.channel';
import { SlackChannel } from './slack.channel';
import { WebhookChannel } from './webhook.channel';
import { InAppChannel } from './in-app.channel';
import { ChannelRouter } from './channel-router.service';

@Global()
@Module({
  providers: [EmailChannel, SlackChannel, WebhookChannel, InAppChannel, ChannelRouter],
  exports: [ChannelRouter],
})
export class ChannelModule {}
