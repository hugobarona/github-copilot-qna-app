# TASK 4 Result — Implement Azure Redis Integration

## Summary
Implemented a production-ready Redis service for Azure Cache for Redis using **hash storage** and a sorted index.

Implemented methods:
- `saveQuestion(question)`
- `saveAnswer(questionId, answer)`
- `incrementUpvote(questionId)`
- `getAllQuestions()`
- `getQuestionById(id)`

## Storage Model (Redis Hash + Sorted Set)

### Keys
- Question hash key: `question:{id}`
- Question index key: `questions:byCreatedAt` (sorted set)

### Stored fields in hash
- `id`
- `question`
- `upvotes`
- `status`
- `answer` (optional)
- `answeredBy` (optional)
- `createdAt`
- `updatedAt`

### Ordering strategy
- `questions:byCreatedAt` stores question IDs with timestamp score.
- `getAllQuestions()` reads IDs from the sorted set in reverse order (newest first), then hydrates hashes.

## Azure Connection Support
Service supports these configuration options (in order):
1. `REDIS_URL`
2. `REDIS_CONNECTION_STRING`
3. `AZURE_REDIS_HOST` + `AZURE_REDIS_KEY` (+ optional `AZURE_REDIS_PORT`, default `6380`)

If host/key are used, it builds a secure `rediss://` URL.

## Files Added
- `/app/functions/services/redisService.ts`
- `/app/functions/types/question.ts`

## Method Behavior

### `saveQuestion(input)`
- Validates non-empty question text
- Creates question record with UUID, default status `unanswered`, upvotes `0`
- Persists hash and adds ID to sorted index in one transaction (`multi/exec`)
- Returns stored question object

### `getQuestionById(id)`
- Loads question hash by key
- Returns `null` if not found

### `saveAnswer(questionId, input)`
- Validates non-empty answer text
- Ensures question exists
- Updates `answer`, `status=answered`, `updatedAt` (and optional `answeredBy`)
- Returns updated question object

### `incrementUpvote(questionId)`
- Ensures question exists
- Atomically increments `upvotes` with `hIncrBy`
- Updates `updatedAt`
- Returns updated question object

### `getAllQuestions()`
- Reads question IDs from sorted set (newest first)
- Bulk fetches hashes via `multi`
- Maps hash -> typed question objects
- Returns sorted list

### `disconnectRedis()`
- Gracefully closes open Redis connection

## Validation
- Frontend workspace build still passes after integration work:
  - `npm run build` succeeded

## Notes
- This task intentionally implements Redis integration as a backend service module under `/app/functions` for safe server-side usage.
- API routes that call this service will be connected in TASK 7.
