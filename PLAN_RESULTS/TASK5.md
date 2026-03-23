# TASK 5 Result — Implement Microsoft Foundry GPT Call

## Summary
Implemented a server-side Foundry service under `/app/functions/services/foundryService.ts`.

Implemented capability:
- send prompt text to a Microsoft Foundry-compatible chat completions endpoint
- receive a generated answer
- return structured JSON
- retry on transient failures
- enforce request timeout

## Files Added
- `/app/functions/services/foundryService.ts`

## Public API

### `generateAnswer(input)`
Accepts:
- `question` (required)
- `audience` (optional)
- `systemPrompt` (optional)

Returns:
- `{ answer: string, answeredBy: string }`

## Environment Variables
The service supports flexible configuration names so it can work with either Foundry-specific or Azure OpenAI-style naming.

Supported endpoint variables:
- `FOUNDRY_ENDPOINT`
- `AI_FOUNDRY_ENDPOINT`
- `AZURE_OPENAI_ENDPOINT`

Supported API key variables:
- `FOUNDRY_API_KEY`
- `AI_FOUNDRY_API_KEY`
- `AZURE_OPENAI_API_KEY`

Supported deployment variables:
- `FOUNDRY_DEPLOYMENT`
- `AI_FOUNDRY_DEPLOYMENT`
- `AZURE_OPENAI_DEPLOYMENT`

Optional settings:
- `FOUNDRY_API_VERSION` (default: `2024-10-21`)
- `FOUNDRY_TIMEOUT_MS` (default: `15000`)
- `FOUNDRY_MAX_RETRIES` (default: `2`)

## Behavior

### Request construction
- Builds a chat-completions URL from the configured endpoint and deployment.
- Sends a system prompt instructing the model to return only JSON.
- Sends the user question plus audience guidance.
- Requests `json_object` output format.

### Response handling
- Reads the first model message from the response.
- Strips optional markdown code fences.
- Parses JSON and validates required fields.
- Defaults `answeredBy` to `Microsoft Foundry GPT` when omitted.

### Retry logic
Retries with exponential backoff for:
- network failures
- timeout-compatible failures
- HTTP `408`
- HTTP `429`
- HTTP `5xx`

### Error handling
- Throws clear configuration errors when env vars are missing.
- Throws timeout errors when the request exceeds the configured limit.
- Throws validation errors when the model does not return the required JSON shape.

## Notes
- This task adds the Foundry integration service only.
- Wiring question submission to call Foundry and then persist answers belongs to later tasks (`TASK 6` / `TASK 7`).