export interface ApiResponse<T> {
  ok: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    retryable?: boolean;
    trace_id?: string | null;
    event_id?: string | null;
  } | null;
  meta: {
    version: string;
    contract_version: string;
    timestamp: string;
    trace_id: string;
    event_id?: string | null;
  };
}
