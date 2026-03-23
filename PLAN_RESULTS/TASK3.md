# TASK 3 Result — Migrate and Refactor Figma UI

## Summary
Migrated the core Ask a Question UI from /Design into /app, removed hardcoded sample content, and implemented required routing:
- / -> QuestionFeed
- /ask -> AskQuestion
- /question/:id -> QuestionDetail

## Reused from /Design

### Screens migrated and refactored
- QuestionFeed
- AskQuestion
- QuestionDetail

### Components migrated
- QuestionCard
- UI primitives: button, card, badge, textarea
- Utility: cn helper (utils.ts)

### Styles migrated
- src/styles/index.css
- src/styles/tailwind.css
- src/styles/theme.css
- src/styles/fonts.css

## Refactor work completed

1. Removed hardcoded mock datasets:
- Deleted hardcoded initial questions in QuestionFeed
- Deleted hardcoded question dictionary in QuestionDetail
- Removed console-only submit logic in AskQuestion

2. Added central question state to support real data flow later:
- Created QuestionsContext provider
- Added addQuestion, toggleUpvote, and getQuestionById methods
- Seed state is empty (no sample seed data)

3. Implemented routing for required paths:
- Created routes.tsx using createBrowserRouter
- Wired RouterProvider in App.tsx
- Wrapped app with QuestionsProvider in main.tsx

4. Updated project styling and build setup:
- Switched to migrated style pipeline via src/styles/index.css
- Enabled Tailwind v4 Vite plugin in vite.config.ts

## Files Added
- /app/src/routes.tsx
- /app/src/types/question.ts
- /app/src/context/QuestionsContext.tsx
- /app/src/components/QuestionCard.tsx
- /app/src/components/ui/utils.ts
- /app/src/components/ui/button.tsx
- /app/src/components/ui/card.tsx
- /app/src/components/ui/badge.tsx
- /app/src/components/ui/textarea.tsx
- /app/src/screens/QuestionFeed.tsx
- /app/src/screens/AskQuestion.tsx
- /app/src/screens/QuestionDetail.tsx
- /app/src/styles/index.css
- /app/src/styles/tailwind.css
- /app/src/styles/theme.css
- /app/src/styles/fonts.css

## Files Updated
- /app/src/App.tsx
- /app/src/main.tsx
- /app/vite.config.ts
- /app/package.json (added lucide-react dependency)

## Validation
- Installed required icon dependency: lucide-react
- Build command passed successfully:
  - npm run build
  - Result: production build completed with no TypeScript or Vite errors

## Notes
This task intentionally keeps data in local app state (without mock seed content) so TASK 4+ can replace state operations with Redis + Foundry-backed API flow.
