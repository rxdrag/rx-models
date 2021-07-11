export enum CommandType {
  QUERY_ENTITY_COMMAND = 1,
  QUERY_RELATION_COMMAND,
  //condition command 既可以用于Medel级别，也可以用于relation级别
  QUERY_CONDITION_COMMAND,
  POST_ENTITY_COMMAND,
  POST_RELATION_COMMAND,
}
