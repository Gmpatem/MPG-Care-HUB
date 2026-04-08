/**
 * Get a user-friendly error message from various error types
 * 
 * Maps technical errors to operational, user-friendly messages
 * suitable for hospital/clinical workflows.
 */
export function getFriendlyErrorMessage(
  input: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const message =
    typeof input === "string"
      ? input
      : input instanceof Error
      ? input.message
      : "";

  const normalized = message.toLowerCase();

  if (!normalized) return fallback;

  // ============================================================================
  // AUTHENTICATION ERRORS
  // ============================================================================

  if (normalized.includes("invalid login credentials")) {
    return "The email or password is incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Check your inbox for the verification link.";
  }

  if (normalized.includes("jwt expired") || normalized.includes("session")) {
    return "Your session expired. Please sign in again.";
  }

  // ============================================================================
  // NETWORK / CONNECTIVITY ERRORS (Pack L2 - Low-bandwidth UX)
  // ============================================================================

  if (
    normalized.includes("networkerror") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("network request failed")
  ) {
    return "Could not connect to the server. Please check your internet connection and try again.";
  }

  if (
    normalized.includes("timeout") ||
    normalized.includes("timed out") ||
    normalized.includes("etimedout")
  ) {
    return "The request took too long. Please check your connection and try again.";
  }

  if (
    normalized.includes("network") ||
    normalized.includes("fetch") ||
    normalized.includes("internet")
  ) {
    return "We couldn't reach the server. Please check your connection and try again.";
  }

  if (
    normalized.includes("offline") ||
    normalized.includes("no connection") ||
    normalized.includes("enetunreach")
  ) {
    return "You appear to be offline. Please check your connection and try again.";
  }

  if (
    normalized.includes("econnrefused") ||
    normalized.includes("econnreset") ||
    normalized.includes("ENOTFOUND")
  ) {
    return "Could not connect to the server. Please try again in a moment.";
  }

  // ============================================================================
  // HTTP STATUS ERRORS
  // ============================================================================

  if (
    normalized.includes("400") ||
    normalized.includes("bad request")
  ) {
    return "The request was invalid. Please check your input and try again.";
  }

  if (
    normalized.includes("401") ||
    normalized.includes("unauthorized")
  ) {
    return "You need to sign in to complete this action.";
  }

  if (
    normalized.includes("403") ||
    normalized.includes("forbidden")
  ) {
    return "You do not have permission to complete this action.";
  }

  if (
    normalized.includes("404") ||
    normalized.includes("not found")
  ) {
    return "The requested item could not be found. It may have been deleted or moved.";
  }

  if (
    normalized.includes("409") ||
    normalized.includes("conflict")
  ) {
    return "This action conflicts with another change. Please refresh and try again.";
  }

  if (
    normalized.includes("429") ||
    normalized.includes("too many requests") ||
    normalized.includes("rate limit")
  ) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (
    normalized.includes("500") ||
    normalized.includes("502") ||
    normalized.includes("503") ||
    normalized.includes("504") ||
    normalized.includes("internal server error") ||
    normalized.includes("bad gateway") ||
    normalized.includes("service unavailable") ||
    normalized.includes("gateway timeout")
  ) {
    return "The server encountered an error. Please try again in a moment.";
  }

  // ============================================================================
  // DATA / VALIDATION ERRORS
  // ============================================================================

  if (
    normalized.includes("duplicate key value") ||
    normalized.includes("already exists") ||
    normalized.includes("unique constraint")
  ) {
    return "That record already exists. Please check the details and try again.";
  }

  if (
    normalized.includes("required") ||
    normalized.includes("cannot be empty") ||
    normalized.includes("missing")
  ) {
    return "Please fill in all required fields.";
  }

  if (
    normalized.includes("invalid") ||
    normalized.includes("validation")
  ) {
    return "Please check your input and try again.";
  }

  // ============================================================================
  // DOMAIN-SPECIFIC ERRORS
  // ============================================================================

  if (normalized.includes("hospital not found")) {
    return "The selected hospital could not be found.";
  }

  if (normalized.includes("patient not found")) {
    return "The selected patient could not be found.";
  }

  if (normalized.includes("encounter not found")) {
    return "The selected encounter could not be found.";
  }

  if (normalized.includes("admission not found")) {
    return "The admission record could not be found.";
  }

  if (normalized.includes("bed not available") || normalized.includes("bed is occupied")) {
    return "This bed is no longer available. Please select a different bed.";
  }

  if (normalized.includes("stock") || normalized.includes("inventory")) {
    return "There was an issue with inventory. Please check stock levels and try again.";
  }

  if (normalized.includes("payment") || normalized.includes("billing")) {
    return "There was an issue processing the payment. Please try again.";
  }

  if (normalized.includes("discharge") && normalized.includes("not ready")) {
    return "This patient is not ready for discharge. Please complete all required steps.";
  }

  // ============================================================================
  // RATE LIMITING / THROTTLING
  // ============================================================================

  if (
    normalized.includes("throttle") ||
    normalized.includes("too fast") ||
    normalized.includes("slow down")
  ) {
    return "Please wait a moment before trying again.";
  }

  // ============================================================================
  // ABORT / CANCEL ERRORS
  // ============================================================================

  if (
    normalized.includes("aborted") ||
    normalized.includes("cancelled") ||
    normalized.includes("abortcontroller")
  ) {
    return "The operation was cancelled. Please try again.";
  }

  // Return original message if no mapping found, or fallback if empty
  return message.trim() || fallback;
}

/**
 * Get a user-friendly title for error states
 * 
 * Use for error panel titles, modal headers, etc.
 */
export function getFriendlyErrorTitle(input: unknown): string {
  const message =
    typeof input === "string"
      ? input
      : input instanceof Error
      ? input.message
      : "";

  const normalized = message.toLowerCase();

  if (
    normalized.includes("network") ||
    normalized.includes("timeout") ||
    normalized.includes("fetch") ||
    normalized.includes("offline") ||
    normalized.includes("econn")
  ) {
    return "Connection Problem";
  }

  if (
    normalized.includes("401") ||
    normalized.includes("403") ||
    normalized.includes("unauthorized") ||
    normalized.includes("permission")
  ) {
    return "Access Denied";
  }

  if (
    normalized.includes("404") ||
    normalized.includes("not found")
  ) {
    return "Not Found";
  }

  if (
    normalized.includes("500") ||
    normalized.includes("503") ||
    normalized.includes("server error")
  ) {
    return "Server Error";
  }

  if (
    normalized.includes("duplicate") ||
    normalized.includes("already exists")
  ) {
    return "Already Exists";
  }

  if (
    normalized.includes("validation") ||
    normalized.includes("invalid")
  ) {
    return "Invalid Input";
  }

  return "Error";
}

/**
 * Check if an error is retryable
 * 
 * Determines whether a failed operation should offer a retry option
 */
export function isRetryableError(input: unknown): boolean {
  const message =
    typeof input === "string"
      ? input
      : input instanceof Error
      ? input.message
      : "";

  const normalized = message.toLowerCase();

  // Network errors are typically retryable
  if (
    normalized.includes("network") ||
    normalized.includes("timeout") ||
    normalized.includes("fetch") ||
    normalized.includes("econn") ||
    normalized.includes("offline") ||
    normalized.includes("503") ||
    normalized.includes("502") ||
    normalized.includes("504") ||
    normalized.includes("429") ||
    normalized.includes("rate limit") ||
    normalized.includes("throttle")
  ) {
    return true;
  }

  // Auth errors are not retryable (need to re-authenticate)
  if (
    normalized.includes("401") ||
    normalized.includes("jwt expired") ||
    normalized.includes("session")
  ) {
    return false;
  }

  // Validation errors are not retryable (need to fix input)
  if (
    normalized.includes("validation") ||
    normalized.includes("invalid") ||
    normalized.includes("required")
  ) {
    return false;
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Get retry guidance message
 * 
 * Returns contextual guidance for retry actions
 */
export function getRetryGuidance(input: unknown): string {
  const message =
    typeof input === "string"
      ? input
      : input instanceof Error
      ? input.message
      : "";

  const normalized = message.toLowerCase();

  if (
    normalized.includes("timeout") ||
    normalized.includes("slow")
  ) {
    return "Please wait a moment and try again.";
  }

  if (
    normalized.includes("network") ||
    normalized.includes("connection")
  ) {
    return "Please check your connection and try again.";
  }

  if (
    normalized.includes("500") ||
    normalized.includes("503") ||
    normalized.includes("server")
  ) {
    return "The server is temporarily unavailable. Please try again in a moment.";
  }

  if (
    normalized.includes("429") ||
    normalized.includes("rate limit")
  ) {
    return "Please wait a moment before trying again.";
  }

  return "Please try again.";
}
