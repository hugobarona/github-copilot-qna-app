# Development Plan — “Ask a Question” Classroom App

This project uses the Figma-generated source code located in `/Design`.  
The goal is to analyze, reuse, and refactor that code to create a new working application in `/app`.

The application flow:
1. Students submit questions.
2. Questions are saved into Azure Cache for Redis.
3. The server calls a Microsoft Foundry GPT model to generate an answer.
4. The generated answer is stored in Redis.
5. The UI updates in real-time based on cached data.

---

## ✅ TASK 1 — Analyze Figma-Generated Code in /Design
- Scan the `/Design` folder.
- Identify reusable components, screens, styles.
- Document:
  - folder structure
  - components to migrate
  - dead code or unused assets
  - missing logic or routing

Output: `/PLAN_RESULTS/TASK1.md`

---

## ✅ TASK 2 — Scaffold New Application in /app
- Create a **clean React + Vite** application in `/app`
- Install:
  - TailwindCSS (if used by Figma)
  - Radix UI (if used in Figma code)
  - React Router
  - Redis client libraries (Upstash or Azure SDK)
  - Axios/fetch for API calls
- Create initial folder structure:
  - `/app/src/components`
  - `/app/src/screens`
  - `/app/src/services`
  - `/app/src/hooks`
  - `/app/src/context`
  - `/app/functions` (Azure Static Web Apps API)

Output: `/PLAN_RESULTS/TASK2.md`

---

## ✅ TASK 3 — Migrate and Refactor Figma UI
- Reuse:
  - components from `/Design/src/components`
  - screens from `/Design/src/screens`
  - styles from `/Design/src/styles`
- Remove any hardcoded sample content from Figma output.
- Implement routing:
  - `/` → QuestionsFeed
  - `/ask` → AskQuestion
  - `/question/:id` → QuestionDetail

Output: `/PLAN_RESULTS/TASK3.md`

---

## ✅ TASK 4 — Implement Azure Redis Integration
- Create a `redisService.ts` to:
  - connect to Azure Cache for Redis
  - `saveQuestion(question)`
  - `saveAnswer(questionId, answer)`
  - `incrementUpvote(questionId)`
  - `getAllQuestions()`
  - `getQuestionById(id)`

- Use Azure Redis JSON or hash storage.
- Update the app to use the redisService and persist data in cache

Output: `/PLAN_RESULTS/TASK4.md`

---

## ✅ TASK 5 — Implement Microsoft Foundry GPT Call
- Create a `foundryService.ts` to:
  - send prompt text to your Foundry GPT endpoint
  - receive a generated answer
  - return structured JSON

- Add retry logic + error handling.
Output: `/PLAN_RESULTS/TASK5.md`

---

## ✅ TASK 6 — Connect UI → API → Redis → Foundry
On question submission:
1. Call Redis → save the question  
2. Call Foundry → generate an answer  
3. Call Redis → store answer  
4. Update UI state automatically

- Add loading states + optimistic UI.

Output: `/PLAN_RESULTS/TASK6.md`

---

## ✅ TASK 7 — Create a bicep template to deploy this app to an Azure static web app
- Create a devops folder under the root folder
- Create a bicep template to create an azure static web app to host this app
- Deploy the bicep template considering the following parameters
  - Subscription "Microsoft Azure Sponsorship 25"
  - resource group "rg-github-demo"

Output: `/PLAN_RESULTS/TASK7.md`

---

## ✅ TASK 8 — Deploy Using Azure CLI

- Prepare the application for deployment using the Azure CLI and the Static Web Apps CLI (swa deploy).
- Ensure environment variables (Redis connection, Foundry endpoint, Foundry API key) are configured correctly for deployment.
- Deploy app to the SWA created in previous task

Output: /PLAN_RESULTS/TASK8.md

---

## ✅ TASK 9 — Final QA and Cleanup
- Remove unused files
- Run prettier + eslint
- Produce `/FINAL_REPORT.md`

---