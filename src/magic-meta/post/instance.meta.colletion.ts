import { PostDirective } from 'src/directive/post/post.directive';
import { InstanceMeta } from './instance.meta';

export class InstanceMetaCollection {
  instances: InstanceMeta[] = [];
  directives: PostDirective[] = [];
  entity: string;
  isSingle = false;
}
