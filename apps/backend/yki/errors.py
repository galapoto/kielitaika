class YKIError(Exception):
    default_code = "YKI_ERROR"

    def __init__(
        self,
        code: str | None = None,
        message: str | None = None,
        *,
        details: dict | None = None,
    ):
        self.code = code or self.default_code
        self.message = message or self.code
        self.details = details or {}
        super().__init__(self.message)


class ContractViolation(YKIError):
    default_code = "CONTRACT_VIOLATION"


class InvalidTransition(YKIError):
    default_code = "INVALID_TRANSITION"


class EngineFailure(YKIError):
    default_code = "ENGINE_FAILURE"


class SessionNotFound(YKIError):
    default_code = "SESSION_NOT_FOUND"
