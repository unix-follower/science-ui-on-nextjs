export enum ErrorCode {
  CONNECTION_REFUSED,
}

export enum ApiErrorCode {
  UNKNOWN = -1,
  ENTITY_NOT_FOUND = 1,
}

export interface ApiErrorResponse {
  errorCode: ApiErrorCode
}

export default class ApiError extends Error {
  private readonly _errorCode: ApiErrorCode | ErrorCode
  private readonly _response?: Response | undefined

  constructor(
    errorCode: ApiErrorCode | ErrorCode,
    response: Response | undefined = undefined,
    cause: unknown | null = null,
    message: string | null = null,
  ) {
    super(message || undefined)
    this._response = response
    this.cause = cause
    this._errorCode = errorCode || ApiErrorCode.UNKNOWN
  }

  get errorCode(): ApiErrorCode | ErrorCode {
    return this._errorCode
  }

  get response(): Response | undefined {
    return this._response
  }
}
