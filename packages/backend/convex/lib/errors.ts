export const APP_ERROR_CODES = {
	UNAUTHORIZED: "UNAUTHORIZED",
	USER_NOT_FOUND: "USER_NOT_FOUND",
	ORG_NOT_FOUND: "ORG_NOT_FOUND",
	ORG_FORBIDDEN: "ORG_FORBIDDEN",
	ORG_DISABLED: "ORG_DISABLED",
	ORG_CONFIG_FORBIDDEN: "ORG_CONFIG_FORBIDDEN",
	VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type AppErrorCode =
	(typeof APP_ERROR_CODES)[keyof typeof APP_ERROR_CODES];

export class AppError extends Error {
	code: AppErrorCode;
	details?: Record<string, unknown>;

	constructor(
		code: AppErrorCode,
		message: string,
		details?: Record<string, unknown>,
	) {
		super(`[${code}] ${message}`);
		this.name = "AppError";
		this.code = code;
		this.details = details;
	}
}

export function toPublicError(error: unknown): never {
	if (error instanceof AppError) {
		throw new Error(`[${error.code}] ${error.message}`);
	}
	if (error instanceof Error) {
		throw error;
	}
	throw new Error("Unknown error");
}
