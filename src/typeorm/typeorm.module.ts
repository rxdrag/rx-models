import { Global, Module } from '@nestjs/common';
import { SchemaModule } from 'src/schema/schema.module';
import { TypeOrmService } from './typeorm.service';

@Global()
@Module({
  imports: [SchemaModule],
  providers: [TypeOrmService],
  exports: [TypeOrmService],
})
export class TypeOrmModule {}
