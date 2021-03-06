import { DirectiveMeta } from '../directive.meta';
import { QueryDirective } from './query.directive';
import { MagicService } from 'src/magic-meta/magic.service';
import { QueryRootMeta } from 'src/magic-meta/query/query.root-meta';
import { QueryEntityMeta } from 'src/magic-meta/query/query.entity-meta';
import { SchemaService } from 'src/schema/schema.service';

export class QueryConditionDirective extends QueryDirective {
  constructor(
    protected readonly directiveMeta: DirectiveMeta,
    protected readonly rootMeta: QueryRootMeta,
    protected readonly ownerMeta: QueryEntityMeta,
    protected readonly field: string,
    protected readonly magicService: MagicService,
    protected readonly schemaService: SchemaService,
  ) {
    super(directiveMeta, rootMeta, magicService, schemaService);
  }

  get value() {
    return this.directiveMeta?.value;
  }
}
