import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RxAuth } from './RxAuth';
import { RxNotification } from './RxNotification';
import { RxPage } from './RxPage';

@Entity()
export class RxApp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  isSystem: boolean;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  appType: string;

  @OneToMany(() => RxPage, (page) => page.app)
  pages: RxPage[];

  @Column('simple-json')
  navigationTtems: any;

  @OneToMany(() => RxAuth, (auth) => auth.app)
  auths: RxAuth[];

  @OneToMany(() => RxNotification, (notification) => notification.app)
  notifications?: RxNotification[];

  @Column({ nullable: true })
  entryPageId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
