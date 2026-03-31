export interface ApiResponse<T> {
  ok: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    retryable?: boolean;
  } | null;
  meta: {
    version: string;
    contract_version: string;
    timestamp: string;
  };
}
