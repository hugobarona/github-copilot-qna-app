# TASK 6 Result — Connect UI → API → Redis → Foundry

## Summary
Connected question submission from the React UI through the backend workflow:

1. save question to Redis
2. call Foundry to generate an answer
3. save the generated answer back to Redis
4. return the updated question so the UI state updates automatically

Also added:
- optimistic UI on question submission
- loading states during submission
- warning propagation when the question is saved but answer generation fails

## Files Added
- `/app/functions/services/questionSubmissionService.ts`
- `/PLAN_RESULTS/TASK6.md`

## Files Updated
- `/app/api/questions/route.ts`
- `/app/vite.config.ts`
- `/app/src/services/questionsApi.ts`
- `/app/src/context/QuestionsContext.tsx`
- `/app/src/screens/AskQuestion.tsx`
- `/app/src/screens/QuestionDetail.tsx`

## Backend Workflow

### Shared orchestration service
Created `/app/functions/services/questionSubmissionService.ts` to centralize submission behavior:
- `saveQuestion(question)` first
- `generateAnswer(question)` second
- `saveAnswer(questionId, answer)` third

This avoids duplicating the workflow in multiple route handlers.

### API integration
Both backend entry points now use the same workflow:
- `/app/api/questions/route.ts`
- local Vite dev API middleware in `/app/vite.config.ts`

That keeps local development behavior aligned with the future deployed API behavior.

## UI Behavior

### Optimistic UI
On submit, the client now inserts a temporary local question immediately before the API call resolves.

If the API succeeds:
- the optimistic item is replaced with the real saved question

If the API fails:
- the optimistic item is removed

### Loading states
The Ask Question screen now shows a longer-running submission message while the backend saves the question and generates the answer.

### Partial failure handling
If Redis save succeeds but Foundry answer generation fails:
- the saved question is still returned to the UI
- the question remains `unanswered`
- a warning is passed back to the client
- the detail screen displays that warning to the user

This prevents duplicate question creation on retry and preserves the successfully saved data.

## Notes
- This task wires the question submission flow only.
- Real-time push updates are not yet implemented; the UI updates automatically from returned API data and optimistic client state.
- Full deployment-aligned API completion remains in `TASK 7`.