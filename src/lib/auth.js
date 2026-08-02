import { createHmac, randomBytes } from "crypto";

const SECRET_PREFIX = "nexus-chat-v1";

/**
 * Generate a session token from the APP_PASSWORD.
 * Token = HMAC-SHA256( SECRET_PREFIX + password, randomSalt ) + "." + salt
 */
export function generateToken() {
  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error("APP_PASSWORD is not configured");

  const salt = randomBytes(16).toString("hex");
  const hmac = createHmac("sha256", SECRET_PREFIX + password);
  hmac.update(salt);
  const hash = hmac.digest("hex");

  return `${hash}.${salt}`;
}

/**
 * Validate a session token against the configured APP_PASSWORD.
 */
export function validateToken(token) {
  const password = process.env.APP_PASSWORD;
  if (!password || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [hash, salt] = parts;
  const hmac = createHmac("sha256", SECRET_PREFIX + password);
  hmac.update(salt);
  const expected = hmac.digest("hex");

  return hash === expected;
}

/**
 * Validate the password directly.
 */
export function validatePassword(password) {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) return false;
  return password === appPassword;
}

/**
 * Extract and validate token from Authorization header.
 * Returns { valid: boolean, error?: string }
 */
export function authenticateRequest(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing authorization token" };
  }

  const token = authHeader.slice(7);
  if (!validateToken(token)) {
    return { valid: false, error: "Invalid or expired session token" };
  }

  return { valid: true };
}
