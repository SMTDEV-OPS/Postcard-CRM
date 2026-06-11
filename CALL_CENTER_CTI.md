# Call Center CTI + PMS Customer Integration

## Overview

Call center agents can look up guests by phone. The CRM backend queries the Postcard home-grown PMS Customer API (HMAC auth, server-side only) and merges results with local CRM guest history. A unified **Call Center** screen shows PMS data, CRM history, and a pre-filled lead form.

Knowlarity CTI webhook support is stubbed: when a call arrives, the agent UI receives a WebSocket `call:incoming` event and auto-runs lookup.

## Environment variables (Render backend)

Set these in **Render → Environment** (never commit real values to git):

| Variable | Description |
|----------|-------------|
| `PMS_CRM_BASE_URL` | PMS API base URL (e.g. `https://staging.postcardresorts.com`) |
| `PMS_CRM_API_KEY` | API key from PMS team |
| `PMS_CRM_SECRET_KEY` | Secret key for HMAC signing |

If any of these are empty, PMS lookup is skipped gracefully; local CRM search still works. The API returns `pmsLookupStatus: "not_configured"` and the Call Center UI shows an admin message.

**After adding vars on Render:** Manual Deploy → Clear build cache & deploy. Verify with:

```bash
curl -s "https://YOUR-BACKEND.onrender.com/guests/search-by-phone/9800907654" \
  -H "Authorization: Bearer YOUR_JWT"
```

Expect `pmsCustomer.customerId` = `PC90147536` for the staging test number.

## Frontend (Netlify)

No PMS secrets on the frontend. Ensure:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | Your Render backend URL (e.g. `https://postcardcrm.onrender.com`) |

Redeploy Netlify after changing env vars (Vite bakes the value at build time).

## API flow

1. Agent enters phone (or receives Knowlarity `call:incoming`).
2. Frontend: `GET /api/guests/search-by-phone/:phone`
3. Backend searches local MongoDB guests, then PMS: `GET {PMS_CRM_BASE_URL}/api/crm/customers?phone=...`
4. Response includes `pmsCustomer` when PMS returns a match.

### PMS auth (server-side)

```
data = JSON.stringify(requestBody)   // query params for GET, body for POST
signature = HMAC_SHA256(data + apiKey, secretKey)
Authorization = Base64(signature)
```

Headers: `API-KEY`, `Authorization`, `Content-Type: application/json`

**GET requests:** sign the query string as JSON with **string values**, e.g.:

| Request | Sign body |
|---------|-----------|
| `GET /api/crm/customers?page=1` | `{"page":"1"}` |
| `GET /api/crm/customers?phone=9800907654` | `{"phone":"9800907654"}` |
| `GET /api/crm/customer/PC90147536?membership_id=PC90147536` | `{"membership_id":"PC90147536"}` |

Phone list responses are paginated; the CRM client filters `source.data[]` by matching `mobile`.

## Knowlarity webhook

**URL:** `POST {BACKEND_URL}/api/public/knowlarity-webhook`

Copy from **Settings → Integration → IVR / CTI** in the CRM UI.

### Payload (flexible)

| Field | Description |
|-------|-------------|
| `From` | Caller phone number |
| `To` | Dialed number (optional) |
| `CallSid` | Call identifier (optional) |
| `AgentId` | CRM user MongoDB `_id` (required for routing) |
| `Event` | `ringing`, `answered`, `incoming`, or `start` |

On ringing/answered, backend emits WebSocket event `call:incoming` to `user:{AgentId}`.

### Manual test

```bash
curl -X POST "https://YOUR-BACKEND.onrender.com/api/public/knowlarity-webhook" \
  -H "Content-Type: application/json" \
  -d '{"From":"+919876543210","CallSid":"test-123","AgentId":"YOUR_CRM_USER_ID","Event":"ringing"}'
```

Agent must be logged in with an active WebSocket connection on the Call Center screen.

## Tests

```bash
cd backend
npx ts-node src/services/pms/postcardResortsCrmAuth.test.ts
```

## Staging note

If PMS staging returns 404, confirm base URL and endpoint deployment with the PMS team. Field mapping in `postcardResortsCrmClient.ts` supports common key aliases and can be updated once sample JSON is available.
