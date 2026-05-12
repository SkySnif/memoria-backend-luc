export interface IAdditionalInfo {
  code?: string;
  field?: string;
  value?: unknown;
  operation?: string;
  entity?: string;
  identifier?: string;
  constraint?: string;
  originalError?: string;
  [key: string]: unknown;
}
