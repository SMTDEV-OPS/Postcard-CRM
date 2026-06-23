# Knowlarity Log Push — Integration Spec (share with Knowlarity)

Post-call only. **No CTI / live call routing.**

## Endpoint

| Item | Value |
|------|-------|
| **Method** | `POST` |
| **URL (Production)** | `https://postcard-crm.onrender.com/api/public/knowlarity-call-log` |
| **Content-Type** | `application/json` |
| **Auth** | Header `X-Webhook-Secret: <shared-secret>` (provided separately) |
| **When to push** | After call ends, for answered calls |
| **Retries** | Safe — CRM deduplicates on `call_uuid` |
| **Reachability (GET)** | `GET https://postcard-crm.onrender.com/api/public/knowlarity-call-log` → `{"status":"ready",...}` |

## Troubleshooting

| HTTP | Meaning | Fix |
|------|---------|-----|
| **404** `Cannot POST ...` | Route not on this server | Use `postcard-crm` (hyphen), not `postcardcrm`. Wait for Render deploy after code push. |
| **401** `Unauthorized` | Route works; secret mismatch | Use full `KNOWLARITY_WEBHOOK_SECRET` value in `X-Webhook-Secret` header (64 hex chars). |
| **400** | Invalid JSON / missing required field | Include `call_date`, `call_time`, `caller_number`, `call_direction`, `call_status`, `call_uuid`. |
| **200** `ignored` / `agent_not_mapped` | Webhook accepted; no CRM user for `agent_number` | Map agent numbers in CRM **Settings → Integrations → Knowlarity → Agent mapping**. |

## JSON payload

```json
{
  "call_date": "2026-06-10",
  "call_time": "14:32:05",
  "caller_number": "+919876543210",
  "call_direction": "inbound",
  "called_number": "+911800123456",
  "call_status": "answered",
  "agent_number": "+919811122233",
  "call_transfer_status": "not_transferred",
  "caller_duration": "245",
  "recording_url": "https://recordings.knowlarity.com/abc123.mp3",
  "call_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "hangup_cause": "NORMAL_CLEARING"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `call_date` | Yes | `YYYY-MM-DD` |
| `call_time` | Yes | `HH:mm:ss` (24h) |
| `caller_number` | Yes | Customer phone |
| `call_direction` | Yes | `inbound` or `outbound` |
| `called_number` | Yes | DID / virtual number |
| `call_status` | Yes | e.g. `answered`, `missed` |
| `agent_number` | When answered | Agent phone/extension — mapped to CRM user internally |
| `call_transfer_status` | No | Transfer state |
| `caller_duration` | No | Talk time in seconds |
| `recording_url` | No | Recording URL |
| `call_uuid` | Yes | Unique call ID (idempotency key) |
| `hangup_cause` | No | Hangup reason |

## Sample cURL

```bash
curl -X POST "https://postcard-crm.onrender.com/api/public/knowlarity-call-log" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_SHARED_SECRET" \
  -d '{
    "call_date": "2026-06-10",
    "call_time": "14:32:05",
    "caller_number": "+919876543210",
    "call_direction": "inbound",
    "called_number": "+911800123456",
    "call_status": "answered",
    "agent_number": "+919811122233",
    "call_transfer_status": "not_transferred",
    "caller_duration": "245",
    "recording_url": "https://recordings.knowlarity.com/abc123.mp3",
    "call_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "hangup_cause": "NORMAL_CLEARING"
  }'
```

## CRM response

**Success (200):**
```json
{
  "status": "ok",
  "call_log_id": "67abc123def456789",
  "agent_user_id": "67user123def456789",
  "duplicate": false
}
```

**Ignored (200):**
```json
{
  "status": "ignored",
  "reason": "agent_not_mapped"
}
```

**Invalid payload (400):**
```json
{
  "status": "error",
  "message": "call_uuid is required"
}
```

## Agent mapping (CRM-side)

Knowlarity sends `agent_number`. Postcard CRM admins map each number to a call-center user in **Settings → Integrations → Knowlarity**. No `agent_id` field is required in the Knowlarity payload.

## Environment (Render)

Set on the backend service:

| Variable | Description |
|----------|-------------|
| `KNOWLARITY_WEBHOOK_SECRET` | Shared secret for `X-Webhook-Secret` header validation. Generate with `openssl rand -hex 32` (64 hex characters). |
