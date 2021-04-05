import { Module } from '@nestjs/common';
import { DB_COLLECTION } from './constants';

import { DatabaseModule } from '@app/database';
import { SharedModule } from '@app/shared';

import { EmailRepository } from './email.repository';
import { EmailService } from './email.service';
import { EmailSenderService } from './email-sender.service';

@Module({
  imports: [DatabaseModule.forFeature(DB_COLLECTION), SharedModule],
  providers: [EmailRepository, EmailService, EmailSenderService],
  exports: [EmailService],
})
export class EmailsModule {}
