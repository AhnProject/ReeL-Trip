export class AppError extends Error {
  constructor(
    message: string,
    public readonly errorCode: string,
    public readonly httpStatus: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const AuthError = {
  usernameAlreadyExists: (username: string) =>
    new AppError(`Username already exists: ${username}`, "USERNAME_ALREADY_EXISTS", 400),
  emailAlreadyExists: (email: string) =>
    new AppError(`Email already exists: ${email}`, "EMAIL_ALREADY_EXISTS", 400),
  invalidCredentials: () =>
    new AppError("Invalid username or password", "INVALID_CREDENTIALS", 401),
  userNotFound: (username: string) =>
    new AppError(`User not found: ${username}`, "USER_NOT_FOUND", 404),
  tokenExpired: () => new AppError("Token expired", "TOKEN_EXPIRED", 401),
  invalidToken: () => new AppError("Invalid token", "INVALID_TOKEN", 401),
  unauthorized: () => new AppError("Authentication required", "UNAUTHORIZED", 401),
  accessDenied: () => new AppError("Access denied", "ACCESS_DENIED", 403),
};

export const ParseError = {
  unsupportedUrl: () =>
    new AppError(
      "YouTube Shorts 또는 Instagram Reels URL만 지원합니다",
      "UNSUPPORTED_URL",
      400
    ),
  privateContent: () =>
    new AppError("콘텐츠가 비공개이거나 접근할 수 없습니다", "PRIVATE_CONTENT", 422),
  extractionFailed: () =>
    new AppError("여행/관광 관련 정보를 찾을 수 없습니다", "EXTRACTION_FAILED", 422),
  apifyError: (msg: string) =>
    new AppError(`Apify 오류: ${msg}`, "APIFY_ERROR", 502),
  apifyNotConfigured: () =>
    new AppError("APIFY_API_TOKEN이 설정되지 않았습니다", "APIFY_NOT_CONFIGURED", 500),
};

export const DocumentError = {
  notFound: (id: string | number) =>
    new AppError(`Document not found. ID: ${id}`, "DOCUMENT_NOT_FOUND", 404),
  invalidVectorDimension: (expected: number, actual: number) =>
    new AppError(
      `Invalid vector dimension. Expected: ${expected}, actual: ${actual}`,
      "INVALID_VECTOR_DIMENSION",
      400
    ),
  databaseError: (msg: string) =>
    new AppError(`Database error: ${msg}`, "DATABASE_ERROR", 500),
  invalidInput: (msg: string) =>
    new AppError(`Invalid input: ${msg}`, "INVALID_INPUT", 400),
};
