/**
 * Unified Application Error Class
 * Provides consistent error handling with status codes and error codes
 */

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export enum ErrorCode {
  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  
  // Resource errors
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // File upload errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  VIRUS_DETECTED = 'VIRUS_DETECTED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business logic errors
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export interface ErrorDetails {
  field?: string;
  value?: unknown;
  reason?: string;
  [key: string]: unknown;
}

/**
 * Application Error Class
 * Extends native Error with status codes and error codes
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetails;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true,
    details?: ErrorDetails,
    requestId?: string
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    this.requestId = requestId;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON(): {
    message: string;
    code: ErrorCode;
    statusCode: HttpStatus;
    details?: ErrorDetails;
    requestId?: string;
  } {
    return {
      message: this.message,
      code: this.errorCode,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
      ...(this.requestId && { requestId: this.requestId }),
    };
  }

  /**
   * Create a Bad Request error
   */
  static badRequest(message: string, details?: ErrorDetails, requestId?: string): AppError {
    return new AppError(
      message,
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      true,
      details,
      requestId
    );
  }

  /**
   * Create an Unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized', requestId?: string): AppError {
    return new AppError(
      message,
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      true,
      undefined,
      requestId
    );
  }

  /**
   * Create a Forbidden error
   */
  static forbidden(message: string = 'Forbidden', requestId?: string): AppError {
    return new AppError(
      message,
      HttpStatus.FORBIDDEN,
      ErrorCode.FORBIDDEN,
      true,
      undefined,
      requestId
    );
  }

  /**
   * Create a Not Found error
   */
  static notFound(message: string = 'Resource not found', requestId?: string): AppError {
    return new AppError(
      message,
      HttpStatus.NOT_FOUND,
      ErrorCode.NOT_FOUND,
      true,
      undefined,
      requestId
    );
  }

  /**
   * Create a Conflict error
   */
  static conflict(message: string, details?: ErrorDetails, requestId?: string): AppError {
    return new AppError(
      message,
      HttpStatus.CONFLICT,
      ErrorCode.DUPLICATE_ENTRY,
      true,
      details,
      requestId
    );
  }

  /**
   * Create a Validation error
   */
  static validation(message: string, details?: ErrorDetails, requestId?: string): AppError {
    return new AppError(
      message,
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      true,
      details,
      requestId
    );
  }

  /**
   * Create an Internal Server error
   */
  static internal(message: string = 'Internal server error', requestId?: string): AppError {
    return new AppError(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR,
      false,
      undefined,
      requestId
    );
  }
}

