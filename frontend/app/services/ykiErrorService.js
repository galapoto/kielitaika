/**
 * YKI Error Service
 * Centralized error handling for YKI operations with:
 * - Error categorization
 * - User-friendly messages
 * - Retry mechanism support
 * - State preservation guidance
 */

/**
 * Error types matching backend YKIErrorType enum
 */
export const YKIErrorType = {
  NETWORK_ERROR: 'network_error',
  PERMISSION_ERROR: 'permission_error',
  EMPTY_RECORDING: 'empty_recording',
  TIMEOUT: 'timeout',
  TTS_FAILURE: 'tts_failure',
  STT_FAILURE: 'stt_failure',
  VALIDATION_ERROR: 'validation_error',
  SERVER_ERROR: 'server_error',
  UNKNOWN_ERROR: 'unknown_error',
};

/**
 * Error structure
 */
export class YKIError extends Error {
  constructor(errorType, message, userMessage, options = {}) {
    super(message);
    this.name = 'YKIError';
    this.errorType = errorType;
    this.userMessage = userMessage;
    this.canRetry = options.canRetry !== false;
    this.preserveState = options.preserveState !== false;
    this.fixSteps = options.fixSteps || [];
    this.originalError = options.originalError || null;
  }

  toDisplayFormat() {
    return {
      errorType: this.errorType,
      message: this.userMessage,
      canRetry: this.canRetry,
      preserveState: this.preserveState,
      fixSteps: this.fixSteps,
    };
  }
}

/**
 * Handle network errors
 */
export function handleNetworkError(error, operation = 'YKI operation') {
  console.error(`[YKI Error] Network error during ${operation}:`, error);
  return new YKIError(
    YKIErrorType.NETWORK_ERROR,
    error?.message || 'Network error occurred',
    'Network error. Please check your connection and try again.',
    {
      canRetry: true,
      preserveState: true,
      originalError: error,
    }
  );
}

/**
 * Handle permission errors
 */
export function handlePermissionError(error, permissionType = 'microphone') {
  console.error(`[YKI Error] Permission error (${permissionType}):`, error);
  
  const fixSteps = [];
  if (permissionType === 'microphone') {
    fixSteps.push(
      'Go to your device settings',
      'Find app permissions',
      'Enable microphone access',
      'Return to the app and try again'
    );
  } else if (permissionType === 'storage') {
    fixSteps.push(
      'Go to your device settings',
      'Find app permissions',
      'Enable storage access',
      'Return to the app and try again'
    );
  }

  return new YKIError(
    YKIErrorType.PERMISSION_ERROR,
    error?.message || 'Permission denied',
    `Permission required. Please enable ${permissionType} access in settings.`,
    {
      canRetry: true,
      preserveState: true,
      fixSteps,
      originalError: error,
    }
  );
}

/**
 * Handle empty recording errors
 */
export function handleEmptyRecording() {
  console.warn('[YKI Error] Empty recording detected');
  return new YKIError(
    YKIErrorType.EMPTY_RECORDING,
    'Recording is empty',
    'No audio detected. Please record again and speak clearly.',
    {
      canRetry: true,
      preserveState: true,
      fixSteps: [
        'Check that your microphone is working',
        'Speak louder or closer to the microphone',
        'Try recording again',
      ],
    }
  );
}

/**
 * Handle timeout errors
 */
export function handleTimeoutError(operation = 'operation', timeoutSeconds = 30) {
  console.warn(`[YKI Error] Timeout during ${operation}`);
  return new YKIError(
    YKIErrorType.TIMEOUT,
    `Operation timed out after ${timeoutSeconds} seconds`,
    `The ${operation} took too long. Please try again.`,
    {
      canRetry: true,
      preserveState: true,
      fixSteps: [
        'Check your internet connection',
        'Try again',
      ],
    }
  );
}

/**
 * Handle TTS failures
 */
export function handleTTSFailure(error) {
  console.error('[YKI Error] TTS failure:', error);
  return new YKIError(
    YKIErrorType.TTS_FAILURE,
    error?.message || 'TTS error occurred',
    'Failed to play audio. Please try again.',
    {
      canRetry: true,
      preserveState: true,
      fixSteps: [
        'Check your internet connection',
        'Try playing the audio again',
      ],
      originalError: error,
    }
  );
}

/**
 * Handle STT failures
 */
export function handleSTTFailure(error) {
  console.error('[YKI Error] STT failure:', error);
  return new YKIError(
    YKIErrorType.STT_FAILURE,
    error?.message || 'STT error occurred',
    'Failed to process your speech. Please record again.',
    {
      canRetry: true,
      preserveState: true,
      fixSteps: [
        'Speak clearly and at a normal pace',
        'Check your microphone is working',
        'Try recording again',
      ],
      originalError: error,
    }
  );
}

/**
 * Handle validation errors
 */
export function handleValidationError(message, field = null) {
  console.warn(`[YKI Error] Validation error: ${message}`);
  const userMessage = `Invalid input${field ? ` in ${field}` : ''}. ${message}`;
  return new YKIError(
    YKIErrorType.VALIDATION_ERROR,
    message,
    userMessage,
    {
      canRetry: true,
      preserveState: true,
    }
  );
}

/**
 * Handle server errors
 */
export function handleServerError(error, operation = 'operation') {
  console.error(`[YKI Error] Server error during ${operation}:`, error);
  return new YKIError(
    YKIErrorType.SERVER_ERROR,
    error?.message || 'Server error occurred',
    'Server error. Please try again in a moment.',
    {
      canRetry: true,
      preserveState: true,
      originalError: error,
    }
  );
}

/**
 * Handle unknown errors
 */
export function handleUnknownError(error, operation = 'operation') {
  console.error(`[YKI Error] Unknown error during ${operation}:`, error);
  return new YKIError(
    YKIErrorType.UNKNOWN_ERROR,
    error?.message || 'An unexpected error occurred',
    'An unexpected error occurred. Please try again.',
    {
      canRetry: true,
      preserveState: true,
      originalError: error,
    }
  );
}

/**
 * Wrap an async function with error handling
 */
export async function withYKIErrorHandling(
  operation,
  operationName = 'operation',
  errorHandler = handleUnknownError
) {
  try {
    return await operation();
  } catch (error) {
    // If it's already a YKIError, re-throw it
    if (error instanceof YKIError) {
      throw error;
    }

    // Check error type and handle accordingly
    const errorStr = error?.message?.toLowerCase() || '';
    
    if (errorStr.includes('network') || errorStr.includes('connection') || errorStr.includes('fetch')) {
      throw handleNetworkError(error, operationName);
    } else if (errorStr.includes('permission') || errorStr.includes('access') || errorStr.includes('denied')) {
      throw handlePermissionError(error);
    } else if (errorStr.includes('timeout')) {
      throw handleTimeoutError(operationName);
    } else if (error?.status === 0 || !error?.status) {
      // Network error (status 0 usually means network failure)
      throw handleNetworkError(error, operationName);
    } else if (error?.status >= 500) {
      throw handleServerError(error, operationName);
    } else {
      // Use provided error handler or default to unknown
      throw errorHandler(error, operationName);
    }
  }
}

/**
 * Parse error from API response
 */
export function parseYKIErrorFromResponse(response, defaultMessage = 'An error occurred') {
  if (response.error_type) {
    // Backend returned a structured YKI error
    return new YKIError(
      response.error_type,
      response.technical_details || response.message,
      response.message || defaultMessage,
      {
        canRetry: response.can_retry !== false,
        preserveState: response.preserve_state !== false,
        fixSteps: response.fix_steps || [],
      }
    );
  }
  
  // Fallback to generic error parsing
  const message = response.detail || response.message || response.error || defaultMessage;
  const errorStr = message.toLowerCase();
  
  if (errorStr.includes('network') || errorStr.includes('connection')) {
    return handleNetworkError(new Error(message));
  } else if (errorStr.includes('permission') || errorStr.includes('access')) {
    return handlePermissionError(new Error(message));
  } else if (errorStr.includes('timeout')) {
    return handleTimeoutError();
  } else if (response.status >= 500) {
    return handleServerError(new Error(message));
  } else {
    return handleUnknownError(new Error(message));
  }
}

