export type AppScreen = "home" | "practice" | "conversation" | "yki_intro" | "yki_runtime" | "yki_result" | "professional" | "settings" | "debug";

export type PracticeSection = "vocabulary" | "grammar" | "phrases";

export type ApiSuccessEnvelope<T> = {
  ok: true;
  data: T;
  error: null;
  meta: {
    request_id: string;
    timestamp: string;
    api_version: "v1";
  };
};

export type ApiErrorEnvelope = {
  ok: false;
  data: null;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    details: unknown;
  };
  meta: {
    request_id: string;
    timestamp: string;
    api_version: "v1";
  };
};

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export type AuthUser = {
  user_id: string;
  email: string;
  name: string | null;
  subscription_tier: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_expires_at: string;
  refresh_expires_at: string;
  auth_session_id: string;
};

export type PersistedAuthSession = {
  schema_version: "1";
  auth_user: AuthUser;
  tokens: AuthTokens;
  restored_at: string;
};

export type SubscriptionFeature = {
  available: boolean;
  limit: number;
  unit: string;
  message: string;
};

export type SubscriptionStatus = {
  user_id: string;
  tier: string;
  features: Record<string, SubscriptionFeature>;
  expires_at: string | null;
  trial_ends_at: string | null;
  is_trial: boolean;
  is_active: boolean;
};

export type RoleplaySessionCache = {
  schema_version: "1";
  roleplay_session_id: string;
  speaking_session_id: string;
  state: "created" | "active" | "awaiting_ai" | "completed" | "expired" | "abandoned";
  turn_count: number;
  expires_at: string;
  last_synced_at: string;
};

export type YkiRuntimeCache = {
  schema_version: "1";
  exam_session_id: string;
  level_band: "A1_A2" | "B1_B2" | "C1_C2";
  current_screen_key: string;
  runtime_contract_version: string;
  answers: Record<string, unknown>;
  saved_at: string;
};

export type AuthState =
  | { status: "booting" | "restoring" | "unauthenticated"; session: null }
  | { status: "authenticated"; session: PersistedAuthSession };
