# TASK 8 Result — Implement Azure Static Web Apps Backend

## Summary
Implemented a real Azure Static Web Apps backend under `/app/api` using the Azure Functions v4 programming model.

The backend now exposes these routes:
- `GET /api/questions`
- `POST /api/questions`
- `GET /api/questions/:id`
- `POST /api/questions/:id/upvote`

These routes are connected to the existing Redis and Foundry service layer.

## Files Added
- `/app/api/package.json`
- `/app/api/tsconfig.json`
- `/app/api/host.json`
- `/app/api/local.settings.json`
- `/app/api/src/functions/questions.ts`
- `/app/api/src/functions/questionById.ts`
- `/app/api/src/functions/questionUpvote.ts`
- `/app/start-swa.ps1`
- `/app/staticwebapp.config.json`
- `/PLAN_RESULTS/TASK8.md`

## Files Updated
- `/app/functions/services/redisService.ts`
- `/app/functions/services/questionSubmissionService.ts`
- `/app/api/shared/mappers.ts`

## Backend Structure

### Azure Functions app scaffold
Created a standalone Functions app inside `/app/api` with:
- local package manifest
- TypeScript config
- `host.json`

### HTTP function handlers
Implemented Azure Functions handlers using `@azure/functions`:

#### `/api/questions`
- `GET`: loads all questions from Redis
- `POST`: saves question, generates answer through Foundry, stores answer, returns warning if answer generation fails after save

#### `/api/questions/:id`
- `GET`: loads a single question by id

#### `/api/questions/:id/upvote`
- `POST`: increments question upvotes

## Reused Service Layer
The SWA backend reuses the existing server-side modules:
- `/app/functions/services/redisService.ts`
- `/app/functions/services/foundryService.ts`
- `/app/functions/services/questionSubmissionService.ts`

This keeps local Vite dev behavior and deployed SWA backend behavior aligned.

## Build / Runtime Support
- Added `/app/api/package.json` with `@azure/functions`
- Added backend TypeScript build via `npm run build` inside `/app/api`
- Confirmed Azure Functions Core Tools are installed locally (`func --version` returned `4.7.0`)
- Added local SWA startup script (`npm run swa:start`) that:
	- loads `.env`
	- sets `FUNCTIONS_WORKER_RUNTIME=node`
	- uses a Functions-compatible Node version
	- starts SWA emulator against the Vite app
- Added `staticwebapp.config.json` for SPA navigation fallback while preserving `/api/*`

## Validation
- `/app/api` dependencies installed successfully (`npm install`)
- `/app/api` TypeScript build succeeded
- Main `/app` build also succeeded after shared import updates
- No editor errors remained in the touched backend files
- Local SWA emulation was verified on `http://localhost:4280`
- Verified routes through the SWA emulator:
	- `GET /api/questions`
	- `POST /api/questions`
	- `GET /api/questions/:id`
	- `POST /api/questions/:id/upvote`

## Notes
- Existing route-style files under `/app/api/questions/**/route.ts` were left in place, but the deployable Static Web Apps backend now lives in `/app/api/src/functions`
- Shared imports were normalized to explicit `.js` extensions so both the Vite app and NodeNext Functions build compile correctly
