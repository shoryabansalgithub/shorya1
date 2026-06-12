import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { OutboxRelayService } from './outbox-relay.service';
import { SystemEventsProcessor } from './system-events.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'system-events',
    }),
  ],
  providers: [OutboxRelayService, SystemEventsProcessor],
})
export class OutboxModule {}
