import { Injectable } from '@nestjs/common';
import { CommandMeta } from 'src/command/command.meta';
import { CommandService } from 'src/command/command.service';
import { QueryMeta } from 'src/meta/query/query.meta';
import { QueryRelationMeta } from 'src/meta/query/query.relation-meta';
import { TypeOrmWithSchemaService } from 'src/typeorm-with-schema/typeorm-with-schema.service';
import { QueryModelMeta } from '../../meta/query/query.model-meta';
import { JsonUnit } from '../base/json-unit';
import {
  TOKEN_GET_MANY,
  TOKEN_GET_ONE,
  TOKEN_ON,
  TOKEN_ORDER_BY,
  TOKEN_SELECT,
  TOKEN_WHERE,
} from '../base/tokens';

@Injectable()
export class MagicQueryParser {
  private querMeta: QueryModelMeta;
  constructor(
    private readonly commandService: CommandService,
    private readonly typeOrmService: TypeOrmWithSchemaService,
  ) {}

  parse(jsonStr: string): QueryModelMeta {
    const json = JSON.parse(jsonStr || '{}');
    const meta = new QueryModelMeta();
    this.querMeta = meta;
    this.parseModelLine(json, meta);
    this.parseMeta(json, meta);
    return meta;
  }

  parseModelLine(json: any, meta: QueryModelMeta) {
    for (const keyStr in json) {
      const value = json[keyStr];
      const jsonUnit = new JsonUnit(keyStr, value);
      if (jsonUnit.isModel()) {
        meta.model = jsonUnit.value;
        jsonUnit.commands.forEach((commandMeta) => {
          if (commandMeta.name === TOKEN_GET_ONE) {
            meta.fetchString = TOKEN_GET_ONE;
          } else if (commandMeta.name === TOKEN_GET_MANY) {
            meta.fetchString = TOKEN_GET_MANY;
          } else {
            const commandClass = this.commandService.findModelCommandOrFailed(
              commandMeta.name,
            );
            const command = new commandClass(commandMeta, this.querMeta);
            meta.pushCommand(command);
          }
        });

        delete json[keyStr];
      }
    }
  }

  parseMeta(json: any, meta: QueryMeta) {
    for (const keyStr in json) {
      const value = json[keyStr];
      const jsonUnit = new JsonUnit(keyStr, value);
      this.parseOneLine(jsonUnit, meta);
    }
  }

  parseOneLine(jsonUnit: JsonUnit, meta: QueryMeta) {
    const relationEntitySchemaOptions = this.typeOrmService.findRelationEntitySchema(
      meta.model,
      jsonUnit.key,
    );
    const keyWithoutAt = jsonUnit.key.replace('@', '');
    //如果是关联
    if (relationEntitySchemaOptions) {
      this.parseRelation(jsonUnit, relationEntitySchemaOptions);
    } else if (
      //如果是model指令或者relation指令
      keyWithoutAt === TOKEN_ON ||
      keyWithoutAt === TOKEN_WHERE ||
      keyWithoutAt === TOKEN_SELECT ||
      keyWithoutAt === TOKEN_ORDER_BY ||
      jsonUnit.key.startsWith('@')
    ) {
      this.parseModelOrRelationCommand(keyWithoutAt, jsonUnit, meta);
    } else {
      //剩下的全是条件行
      this.paseConditionCommand(jsonUnit, meta);
    }
  }

  private paseConditionCommand(jsonUnit: JsonUnit, meta: QueryMeta) {
    let commanName = 'equal';
    if (jsonUnit.commands && jsonUnit.commands.length > 0) {
      commanName = jsonUnit.commands[0].name;
    }
    const commandClass = this.commandService.findConditionCommandOrFailed(
      commanName,
    );
    meta.pushCondition(
      new commandClass(
        new CommandMeta(commanName, jsonUnit.value),
        this.querMeta,
        meta,
      ),
    );
  }

  private parseModelOrRelationCommand(
    name: string,
    jsonUnit: JsonUnit,
    meta: QueryMeta,
  ) {
    const cmdMeta = new CommandMeta(name);
    cmdMeta.params = Array.isArray(jsonUnit.value)
      ? jsonUnit.value
      : [jsonUnit.value];
    if (meta instanceof QueryModelMeta) {
      const cmdClass = this.commandService.findModelCommandOrFailed(name);
      meta.pushCommand(new cmdClass(cmdMeta, this.querMeta));
    } else {
      const cmdClass = this.commandService.findRelationCommandOrFailed(name);
      meta.pushCommand(
        new cmdClass(cmdMeta, this.querMeta, meta as QueryRelationMeta),
      );
    }
  }

  private parseRelation(jsonUnit: JsonUnit, relationEntitySchemaOptions) {
    const relation = new QueryRelationMeta();
    relation.name = jsonUnit.key;
    relation.entitySchema = this.typeOrmService.findEntitySchemaOrFailed(
      relationEntitySchemaOptions.target.toString(),
    );
    jsonUnit.commands.forEach((commandMeta) => {
      const commandClass = this.commandService.findRelationCommandOrFailed(
        commandMeta.name,
      );
      relation.pushCommand(new commandClass(commandMeta, this.querMeta));
    });
    this.parseMeta(jsonUnit.value, relation);
  }
}
