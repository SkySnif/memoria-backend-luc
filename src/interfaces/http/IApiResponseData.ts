export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IApiResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: IPaginationMeta;
}

export interface IApiResponseError {
  code: string;
  details?: string;
  field?: string;
}

/**
 * Contrat unique de réponse JSON pour TOUTE l'API.
 * Permet au front de parser de façon prévisible (success/error/meta).
 */
export interface IApiResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: IApiResponseError;
  meta: IApiResponseMeta;
}
