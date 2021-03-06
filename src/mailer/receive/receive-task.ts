import { MailConfig } from 'src/entity-interface/MailConfig';
import { StorageService } from 'src/storage/storage.service';
import { TypeOrmService } from 'src/typeorm/typeorm.service';
import { EVENT_MAIL_RECEIVING_EVENT } from '../consts';
import { MailClient, MailerClientsPool } from '../mailer.clients-pool';
import { IReceiveTasksPool } from './i-receive-tasks-pool';
import { IReceiveJob } from './i-receive-job';
import { MailAddressJob } from './mail-address-job';
import { IReceiveJobOwner } from './i-receive-job-owner';
import { MailerReceiveEventType, MailerReceiveEvent } from './receive-event';

export class ReceiveTask implements IReceiveJobOwner {
  lastEvent?: MailerReceiveEvent;
  private currentJob: IReceiveJob;
  constructor(
    private readonly typeOrmService: TypeOrmService,
    private readonly storageService: StorageService,
    private readonly clientsPool: MailerClientsPool,
    private readonly tasksPool: IReceiveTasksPool,
    private readonly accountId: number,
    private configs: MailConfig[],
  ) {}

  nextJob() {
    if (this.configs.length > 0) {
      this.currentJob = new MailAddressJob(
        this.typeOrmService,
        this.storageService,
        this.configs.pop(),
        this,
        this.accountId,
      );
      return this.currentJob;
    } else {
      //结束任务
      this.tasksPool.removeTask(this.accountId);
      this.lastEvent = {
        type: MailerReceiveEventType.finished,
      };
      this.emitStatusEvent();
      this.lastEvent = undefined;
    }
  }

  finishJob(): void {
    this.nextJob()?.start();
  }

  addConfigs(configs: MailConfig[]) {
    for (const config of configs) {
      if (!this.configs.find((aConfig) => aConfig.address === config.address)) {
        this.configs.push(config);
      }
    }
  }

  start() {
    this.nextJob()?.start();
  }

  emit(event: MailerReceiveEvent) {
    this.lastEvent = event;
    this.emitStatusEvent();
  }

  emitStatusEvent() {
    const clients = this.clientsPool.getByAccountId(this.accountId);
    for (const client of clients) {
      if (client && client.socket.connected) {
        this.emitStatusToClient(client);
      }
    }
  }

  emitStatusToClient(client: MailClient) {
    if (this.lastEvent) {
      client.socket.emit(EVENT_MAIL_RECEIVING_EVENT, this.lastEvent);
    }
  }

  abort() {
    if (this.lastEvent?.type === MailerReceiveEventType.error) {
      this.lastEvent = {
        type: MailerReceiveEventType.aborted,
      };
      this.tasksPool.removeTask(this.accountId);
    } else {
      this.lastEvent = {
        type: MailerReceiveEventType.cancelling,
        message: 'Cancelling...',
      };
    }

    this.emitStatusEvent();
    this.currentJob?.abort();
    this.configs = [];
  }
}
