import { Injectable } from '@nestjs/common';
import { DirectiveStorage } from './directive.storage';
import { PostDirectiveClass } from './post/post.directive.class';

@Injectable()
export class PostDirectiveService {
  constructor(private readonly directiveStorage: DirectiveStorage) {}

  findEntityDirectiveOrFailed(name: string): PostDirectiveClass {
    const directiveClass =
      this.directiveStorage.postEntityDirectiveClasses[name];
    if (!directiveClass) {
      throw new Error(`No entity directive "${name}"`);
    }
    return directiveClass;
  }

  findRelationDirectiveOrFailed(name: string): PostDirectiveClass {
    const directiveClass =
      this.directiveStorage.postRelationDirectiveClasses[name];
    if (!directiveClass) {
      throw new Error(`No relation directive "${name}"`);
    }
    return directiveClass;
  }
}
