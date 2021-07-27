export enum DirectiveType {
  QUERY_ENTITY_DIRECTIVE = 1,
  QUERY_RELATION_DIRECTIVE,
  //condition directive 既可以用于Entity级别，也可以用于relation级别
  QUERY_CONDITION_DIRECTIVE,
  POST_ENTITY_DIRECTIVE,
  POST_RELATION_DIRECTIVE,
  DELETE_DIRECTIVE,
  UPLOAD_DIRECTIVE,
}