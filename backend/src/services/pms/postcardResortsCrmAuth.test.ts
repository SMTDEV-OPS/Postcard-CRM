import assert from "assert";
import crypto from "crypto";
import {
  generatePmsCrmAuthorization,
  stableJsonStringify,
  buildPmsCrmHeaders,
} from "./postcardResortsCrmAuth";
import { buildSignBodyFromQuery } from "./postcardResortsCrmClient";

function expectedAuthorization(
  body: Record<string, unknown>,
  apiKey: string,
  secretKey: string
): string {
  const data = JSON.stringify(body);
  const payload = data + apiKey;
  return crypto.createHmac("sha256", secretKey).update(payload, "utf8").digest("base64");
}

async function runTests() {
  console.log("--- PMS CRM HMAC auth ---");

  const apiKey = "0fc444b6-1e0f-4320-a1b2-3c15065866c6";
  const secretKey = "test-secret-key";
  const emptyBody = {};

  assert.strictEqual(stableJsonStringify(emptyBody), "{}", "GET requests sign {}");

  const auth = generatePmsCrmAuthorization(emptyBody, apiKey, secretKey);
  const expected = expectedAuthorization(emptyBody, apiKey, secretKey);
  assert.strictEqual(auth, expected, "Authorization matches PHP spec (Base64 HMAC-SHA256)");

  const headers = buildPmsCrmHeaders(emptyBody, apiKey, secretKey);
  assert.strictEqual(headers["API-KEY"], apiKey);
  assert.strictEqual(headers.Authorization, expected);
  assert.strictEqual(headers["Content-Type"], "application/json");

  const bodyWithData = { phone: "9876543210" };
  const auth2 = generatePmsCrmAuthorization(bodyWithData, apiKey, secretKey);
  assert.strictEqual(
    auth2,
    expectedAuthorization(bodyWithData, apiKey, secretKey),
    "POST body is signed correctly"
  );

  assert.deepStrictEqual(buildSignBodyFromQuery("?page=1"), { page: "1" });
  assert.deepStrictEqual(buildSignBodyFromQuery("?phone=9800907654"), {
    phone: "9800907654",
  });
  assert.deepStrictEqual(buildSignBodyFromQuery("?membership_id=PC90147536"), {
    membership_id: "PC90147536",
  });

  console.log("✅ PMS CRM HMAC auth passed");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
