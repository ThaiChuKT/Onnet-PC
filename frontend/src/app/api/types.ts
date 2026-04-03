export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  timestamp: string;
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, opts?: { status?: number }) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status;
  }
}

