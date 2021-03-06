import { QueryDirective } from 'src/directive/query/query.directive';
import { DirectiveType } from 'src/directive/directive-type';
import { QueryResult } from 'src/magic-meta/query/query-result';
import { SelectQueryBuilder } from 'typeorm';

export class QueryEntityPaginateDirective extends QueryDirective {
  static description = `
    Magic query directive, Paginate the results.
  `;

  static version = '1.0';

  static directiveType = DirectiveType.QUERY_ENTITY_DIRECTIVE;

  static directiveName = 'paginate';

  isEffectResultCount = true;

  get pageSize(): number {
    return parseInt(this.directiveMeta.value[0]);
  }

  get pageIndex() {
    return parseInt(this.directiveMeta.value[1]);
  }

  addToQueryBuilder(qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    console.assert(
      this.directiveMeta.value?.length > 0,
      'Too few pagination parmas',
    );
    qb.skip(this.pageSize * this.pageIndex).take(this.pageSize);
    this.rootMeta.maxCount = this.pageSize;
    return qb;
  }

  async filterResult(result: QueryResult) {
    result.pagination = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      totalCount: result.totalCount,
    };
    return result;
  }
}
