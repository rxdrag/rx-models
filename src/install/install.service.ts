import { Injectable, Logger } from '@nestjs/common';
import { RxUser } from 'src/entity-interface/RxUser';
import { PackageManageService } from 'src/package-manage/package-manage.service';
import { TypeOrmService } from 'src/typeorm/typeorm.service';
import { DB_CONFIG_FILE, SALT_OR_ROUNDS } from 'src/util/consts';
import { EntitySchema } from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';
import * as bcrypt from 'bcrypt';
import { InstallData } from './install.data';
import * as packagesFromJson from './install.seed.json';
import { RxPackage } from 'src/entity-interface/RxPackage';
import { RxUserStatus } from 'src/entity-interface/RxUserStatus';

const packageSeed = packagesFromJson as RxPackage;

export const CONNECTION_WITH_SCHEMA_NAME = 'withSchema';

@Injectable()
export class InstallService {
  private readonly _logger = new Logger('TypeOrmWithSchemaService');
  private _entitySchemas = new Map<string, EntitySchema>();

  constructor(
    private readonly typeormSerivce: TypeOrmService,
    private readonly packageManage: PackageManageService,
  ) {}

  public async install(data: InstallData) {
    const dbConfigData = {
      type: data.type,
      host: data.host,
      port: data.port,
      database: data.database,
      username: data.username,
      password: data.password,
    };

    //创建配置文件
    await PlatformTools.writeFile(
      DB_CONFIG_FILE,
      JSON.stringify(dbConfigData, null, 2),
    );

    //发布系统包：生成用于构建Schema的文件并重启连接
    await this.packageManage.publishPackages([packageSeed]);

    //把系统包保存到数据库RxPackage表，保存后可以从前端读取并编辑
    await this.packageManage.savePackage(packageSeed);

    //创建超级管理员账号
    await this.createAccount({
      name: 'Admin',
      loginName: data.admin,
      password: await bcrypt.hash(data.adminPassword, SALT_OR_ROUNDS),
      isSupper: true,
      status: RxUserStatus.NORMAL,
    });

    //创建演示账号
    if (data.withDemo) {
      await this.createAccount({
        name: 'Demo',
        loginName: 'demo',
        password: await bcrypt.hash('demo', SALT_OR_ROUNDS),
        isDemo: true,
        status: RxUserStatus.NORMAL,
      });
    }

    return {
      success: true,
    };
  }

  public async isInstalled() {
    return { installed: PlatformTools.fileExist(DB_CONFIG_FILE) };
  }

  private async createAccount(user: RxUser) {
    if (!this.typeormSerivce.connection) {
      throw new Error('Install failed: null connection');
    }
    const repository = this.typeormSerivce.getRepository('RxUser');
    let userWillBeSave = (await repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where({ loginName: user.name })
      .getOne()) as RxUser;
    if (userWillBeSave) {
      for (const key in user) {
        userWillBeSave[key] = user[key];
      }
    } else {
      userWillBeSave = user;
    }

    await repository.save(userWillBeSave);
  }
}
