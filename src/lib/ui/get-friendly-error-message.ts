export function getFriendlyErrorMessage(
  input: unknown,
  fallback = "Something went wrong. Please try again."
) {
  const message =
    typeof input === "string"
      ? input
      : input instanceof Error
      ? input.message
      : "";

  const normalized = message.toLowerCase();

  if (!normalized) return fallback;

  if (normalized.includes("invalid login credentials")) {
    return "The email or password is incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Check your inbox for the verification link.";
  }

  if (normalized.includes("jwt expired") || normalized.includes("session")) {
    return "Your session expired. Please sign in again.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "We couldn’t reach the server. Please check your connection and try again.";
  }

  if (normalized.includes("duplicate key value") || normalized.includes("already exists")) {
    return "That record already exists. Please check the details and try again.";
  }

  if (
    normalized.includes("permission") ||
    normalized.includes("not allowed") ||
    normalized.includes("forbidden")
  ) {
    return "You do not have permission to complete this action.";
  }

  if (normalized.includes("hospital not found")) {
    return "The selected hospital could not be found.";
  }

  if (normalized.includes("patient not found")) {
    return "The selected patient could not be found.";
  }

  if (normalized.includes("encounter not found")) {
    return "The selected encounter could not be found.";
  }

  return message.trim() || fallback;
}
