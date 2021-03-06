import { DeleteDirective } from 'src/directive/delete/delete.directive';
import { RxAbility } from 'src/entity-interface/RxAbility';
import { JsonUnit } from 'src/magic/base/json-unit';
import { TOKEN_SOFT } from 'src/magic/base/tokens';

export class DeleteMeta {
  private _jsonUnit: JsonUnit;
  public directives: DeleteDirective[] = [];
  abilities: RxAbility[] = [];

  constructor(jsonUnit: JsonUnit) {
    this._jsonUnit = jsonUnit;
  }

  get entity() {
    return this._jsonUnit.key;
  }

  get ids() {
    return Array.isArray(this._jsonUnit.value)
      ? this._jsonUnit.value
      : [this._jsonUnit.value];
  }

  get isSoft() {
    return !!this._jsonUnit.getDirective(TOKEN_SOFT);
  }
  /*get cascades() {
    const cascadeCommand = this._jsonUnit.getCommand(TOKEN_CASCADE);
    return cascadeCommand ? cascadeCommand.value : undefined;
  }

  isCascade(relationName: string) {
    if (!this.cascades) {
      return false;
    }
    for (const relation of this.cascades) {
      if (relation === relationName) {
        return true;
      }
    }

    return false;
  }*/
}
