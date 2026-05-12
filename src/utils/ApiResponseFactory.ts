import type { IApiResponseData } from '@/interfaces/http/IApiResponseData';

/**
 * Factory de réponses HTTP standardisées.
 * Toutes les routes /v1/* doivent passer par cette factory.
 */
export class ApiResponseFactory {
  private static generateMeta(requestId?: string): { timestamp: string; requestId?: string } {
    return {
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId })
    };
  }

  public static success<T>(message: string, data?: T, requestId?: string): IApiResponseData<T> {
    return {
      success: true,
      message,
      ...(data !== undefined && { data }),
      meta: ApiResponseFactory.generateMeta(requestId)
    };
  }

  public static error(
    message: string,
    code: string,
    details?: string,
    field?: string,
    requestId?: string
  ): IApiResponseData<null> {
    return {
      success: false,
      message,
      error: {
        code,
        ...(details && { details }),
        ...(field && { field })
      },
      meta: ApiResponseFactory.generateMeta(requestId)
    };
  }

  public static paginated<T>(
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number,
    requestId?: string
  ): IApiResponseData<T[]> {
    return {
      success: true,
      message,
      data,
      meta: {
        ...ApiResponseFactory.generateMeta(requestId),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  }
}
