import { Module } from '@nestjs/common';
import { MailerClientsPool } from './mailer.clients-pool';
import { MailerController } from './mailer.controller';
import { MailerGateway } from './mailer.gateway';
import { MailerTestService } from './mailer.test-service';
import { MailerReceiveTasksPool } from './receive/receive-tasks-pool';
import { MailerSendService } from './send/mailer.send.service';
import { MailerSendTasksPool } from './send/send-tasks-pool';

@Module({
  providers: [
    MailerGateway,
    MailerClientsPool,
    MailerReceiveTasksPool,
    MailerSendTasksPool,
    MailerSendService,
    MailerTestService,
  ],
  exports: [
    MailerGateway,
    MailerClientsPool,
    MailerReceiveTasksPool,
    MailerSendTasksPool,
    MailerSendService,
    MailerTestService,
  ],
  controllers: [MailerController],
})
export class MailerModule {}
