import crypto from "crypto";

/**
 * Stable JSON stringify for HMAC signing (no extra spaces).
 */
export function stableJsonStringify(body: Record<string, unknown>): string {
  return JSON.stringify(body);
}

/**
 * Generate Authorization header per Postcard PMS CRM spec:
 * Base64(HMAC_SHA256(JSON_BODY + API_KEY, SECRET_KEY))
 */
export function generatePmsCrmAuthorization(
  requestBody: Record<string, unknown>,
  apiKey: string,
  secretKey: string
): string {
  const data = stableJsonStringify(requestBody);
  const payload = data + apiKey;
  const signature = crypto.createHmac("sha256", secretKey).update(payload, "utf8").digest();
  return signature.toString("base64");
}

export function buildPmsCrmHeaders(
  requestBody: Record<string, unknown>,
  apiKey: string,
  secretKey: string
): Record<string, string> {
  return {
    "API-KEY": apiKey,
    Authorization: generatePmsCrmAuthorization(requestBody, apiKey, secretKey),
    "Content-Type": "application/json",
  };
}
