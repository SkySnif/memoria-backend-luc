/**
 * Mirror exact de l'enum PostgreSQL `content_type_enum`.
 * Les valeurs DOIVENT correspondre à la BDD à la lettre.
 */
export enum ContentTypeEnum {
  LIVRE = 'livre',
  PODCAST = 'podcast',
  ARTICLE = 'article',
  VIDEO = 'video',
  NOTE = 'note'
}
