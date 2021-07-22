import { JsonUnit } from '../base/json-unit';
import { DeleteMeta } from '../../magic-meta/delete/delete.meta';
import { MagicService } from 'src/magic-meta/magic.service';
import { DeleteDirectiveService } from 'src/directive/delete-directive.service';
import { AbilityService } from '../ability.service';
import { SchemaService } from 'src/schema/schema.service';

export class MagicDeleteParser {
  constructor(
    private readonly deleteCommandService: DeleteDirectiveService,
    private readonly magicService: MagicService,
    private readonly abilityService: AbilityService,
    public readonly schemaService: SchemaService,
  ) {}

  async parse(json: any) {
    const deleteMetas: DeleteMeta[] = [];
    for (const keyStr in json) {
      const value = json[keyStr];
      const jsonUnit = new JsonUnit(keyStr, value);
      const deleteMeta = new DeleteMeta(jsonUnit);
      const entityMeta = this.schemaService.getEntityMetaOrFailed(
        deleteMeta.entity,
      );
      const abilities = await this.abilityService.getEntityDeleteAbilities(
        entityMeta.uuid,
      );
      deleteMeta.abilities = abilities;

      for (const directiveMeta of jsonUnit.commands) {
        const CommandClass = this.deleteCommandService.findCommandOrFailed(
          directiveMeta.name,
        );
        deleteMeta.commands.push(
          new CommandClass(directiveMeta, this.magicService),
        );
      }

      deleteMetas.push(deleteMeta);
    }
    return deleteMetas;
  }
}
