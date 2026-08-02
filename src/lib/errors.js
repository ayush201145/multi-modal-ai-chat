/**
 * Centralized error classifier for AI provider errors.
 * Maps raw API errors to user-friendly messages and HTTP status codes.
 */

const ERROR_MAP = {
  // Authentication / Key errors
  401: {
    status: 401,
    title: "Authentication Failed",
    message: "API key is invalid or has been revoked. Please check your configuration.",
  },
  // Payment / Quota errors
  402: {
    status: 402,
    title: "Quota Exceeded",
    message: "API quota or billing limit has been reached. Please check your account billing.",
  },
  // Access denied
  403: {
    status: 403,
    title: "Access Denied",
    message: "Your API key does not have permission to use this model. Upgrade your plan or use a different model.",
  },
  // Not found (invalid model)
  404: {
    status: 404,
    title: "Model Not Found",
    message: "The requested model does not exist or is not available.",
  },
  // Rate limiting
  429: {
    status: 429,
    title: "Rate Limited",
    message: "Too many requests. Please wait a moment before trying again.",
  },
  // Server errors
  500: {
    status: 500,
    title: "Provider Error",
    message: "The AI provider encountered an internal error. Please try again.",
  },
  502: {
    status: 502,
    title: "Provider Unavailable",
    message: "The AI provider is temporarily unavailable. Please try again later.",
  },
  503: {
    status: 503,
    title: "Service Unavailable",
    message: "The AI service is overloaded or down for maintenance.",
  },
  504: {
    status: 504,
    title: "Request Timeout",
    message: "The request to the AI provider timed out. Please try again.",
  },
};

/**
 * Classify an error from an AI provider into a structured response.
 */
export function classifyError(error) {
  // Check if the error has a status code
  const statusCode =
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.data?.error?.status ||
    500;

  // Check for specific error messages
  const errorMessage =
    error?.message ||
    error?.data?.error?.message ||
    error?.response?.data?.error?.message ||
    "An unexpected error occurred";

  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes("quota") || lowerMessage.includes("billing") || lowerMessage.includes("insufficient_quota")) {
    return { ...ERROR_MAP[402], message: errorMessage, detail: errorMessage };
  }

  if (lowerMessage.includes("rate") || lowerMessage.includes("throttl")) {
    return { ...ERROR_MAP[429], message: errorMessage, detail: errorMessage };
  }

  if (lowerMessage.includes("unauthorized") || lowerMessage.includes("invalid api key") || lowerMessage.includes("invalid x-api-key") || lowerMessage.includes("incorrect api key")) {
    return { ...ERROR_MAP[401], message: errorMessage, detail: errorMessage };
  }

  if (lowerMessage.includes("permission") || lowerMessage.includes("access denied") || lowerMessage.includes("not allowed")) {
    return { ...ERROR_MAP[403], message: errorMessage, detail: errorMessage };
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return { ...ERROR_MAP[504], message: errorMessage, detail: errorMessage };
  }

  if (lowerMessage.includes("not found") || lowerMessage.includes("does not exist")) {
    return { ...ERROR_MAP[404], message: errorMessage, detail: errorMessage };
  }

  const mapped = ERROR_MAP[statusCode];

  return {
    status: statusCode >= 400 ? statusCode : 500,
    title: mapped?.title || "Error",
    message: errorMessage !== "An unexpected error occurred" ? errorMessage : (mapped?.message || errorMessage),
    detail: errorMessage,
  };
}

/**
 * Create a JSON error Response object from a classified error.
 */
export function errorResponse(error) {
  const classified = classifyError(error);
  return Response.json(
    {
      error: {
        title: classified.title,
        message: classified.message,
        detail: classified.detail,
      },
    },
    { status: classified.status }
  );
}
