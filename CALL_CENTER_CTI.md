# Call Center + Knowlarity Log Push

## Overview

Call center agents use the **Call Center** screen for manual phone lookup, PMS guest search, and lead creation. There is **no live CTI / screen-pop** from Knowlarity.

After each answered call, **Knowlarity Log Push** sends a post-call JSON payload to the CRM. Logs are stored under the mapped call-center agent and linked to leads when a matching guest phone exists.

Full spec to share with Knowlarity: [`docs/KNOWLARITY_LOG_PUSH_SPEC.md`](docs/KNOWLARITY_LOG_PUSH_SPEC.md)

## PMS customer lookup

See environment variables in [`backend/RENDER_DEPLOYMENT.md`](backend/RENDER_DEPLOYMENT.md):

| Variable | Description |
|----------|-------------|
| `PMS_CRM_BASE_URL` | PMS API base URL |
| `PMS_CRM_API_KEY` | API key |
| `PMS_CRM_SECRET_KEY` | HMAC secret |

Agents search by phone via `GET /api/guests/search-by-phone/:phone`.

## Knowlarity Log Push

| Item | Value |
|------|-------|
| **URL** | `POST https://postcard-crm.onrender.com/api/public/knowlarity-call-log` |
| **Auth** | Header `X-Webhook-Secret` (matches `KNOWLARITY_WEBHOOK_SECRET` on Render) |
| **UI** | Settings → Integrations → Knowlarity |

### Agent mapping

Admins map each Knowlarity `agent_number` to a CRM user with `callcenter.access` permission. Unmapped or non–call-center agents are ignored (`status: ignored`).

### Manual test

```bash
curl -X POST "https://postcard-crm.onrender.com/api/public/knowlarity-call-log" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_SECRET" \
  -d '{
    "call_date": "2026-06-10",
    "call_time": "14:32:05",
    "caller_number": "+919876543210",
    "call_direction": "inbound",
    "called_number": "+911800123456",
    "call_status": "answered",
    "agent_number": "+919811122233",
    "call_uuid": "test-uuid-001",
    "caller_duration": "120"
  }'
```

Ensure an agent mapping exists for `agent_number` before testing.

## IVR webhook (separate)

IVR lead capture (Exotel / CloudConnect) uses a different endpoint:

`POST /api/public/ivr-webhook`

This is unrelated to Knowlarity.
