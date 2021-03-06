import { RxAbility } from 'src/entity-interface/RxAbility';
import { EntityMeta } from 'src/schema/graph-meta-interface/entity-meta';
export class UpdateMeta {
  ids?: number[] = [];
  columns: any = {};
  entityMeta: EntityMeta;
  expandFieldForAuth = false;
  abilities: RxAbility[] = [];
  whereSQL?: string;

  get entity() {
    return this.entityMeta.name;
  }
}
