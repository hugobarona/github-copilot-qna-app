# GitHub Copilot Classroom Q&A App

A classroom Q&A web app where students post questions, questions are stored in Azure Cache for Redis, and answers are generated with Microsoft Foundry (Azure OpenAI) and saved back to Redis.

## Project Intent

This project demonstrates an end-to-end AI-assisted app workflow:

1. collect student questions in a clean web UI
2. persist question state in Redis
3. generate AI answers using Foundry
4. persist generated answers
5. surface updates in the UI through API-driven state

It is designed as a practical workshop/demo project for building, debugging, and deploying a modern full-stack app with GitHub Copilot and Azure.

## Core Idea

The app is intentionally structured to separate concerns:

- `app/src`: React + Vite frontend
- `app/functions/services`: backend business logic (Redis + Foundry)
- `app/api/src/functions`: Azure Static Web Apps API (Azure Functions v4 routes)
- `devops`: infrastructure deployment (Bicep)
- `PLAN.md` + `PLAN_RESULTS`: task-based implementation history

This makes it easy to evolve each layer independently while keeping local and cloud behavior aligned.

## What The App Does

- Ask questions from a classroom feed UI
- View all questions and question details
- Upvote questions
- Auto-generate answers for new questions via Foundry
- Persist all state in Redis for shared, durable data

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind
- API: Azure Functions v4 (`@azure/functions`)
- Data: Azure Cache for Redis
- AI: Microsoft Foundry / Azure OpenAI chat completions
- Hosting: Azure Static Web Apps
- IaC: Bicep

## Local Development

### Prerequisites

- Azure Managed Redis instance
	- Access Keys must be enabled in Redis Authentication settings
	- You will use `AZURE_REDIS_HOST`, `AZURE_REDIS_KEY`, and `AZURE_REDIS_PORT`
- Microsoft Foundry setup
	- Foundry resource
	- Foundry Project
	- Deployed GPT model (for example: `gpt-5.4-mini`)
	- You will use `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT`
- Node.js (Vite app works on current Node; local Functions/SWA emulation requires Node 22.x)
- npm
- Azure Functions Core Tools v4
- Azure Static Web Apps CLI (`swa`)

### Run frontend only

```powershell
cd app
npm install
npm run dev
```

### Run local SWA emulation (frontend + API)

```powershell
cd app
npm run swa:start
```

SWA local URL:

- `http://localhost:4280`

## Deployment

### Infrastructure (Static Web App resource)

Bicep template:

- `devops/main.bicep`

Deployment script:

- `devops/deploy-static-webapp.ps1`

### App + API deployment

Use SWA CLI deploy against your existing Static Web App resource:

```powershell
cd app
npm run build
cd api
npm run build
cd ..
swa deploy ./dist --api-location ./api --env production
```

## Required Environment Variables

Redis:

- `AZURE_REDIS_HOST`
- `AZURE_REDIS_KEY`
- `AZURE_REDIS_PORT` (default `6380` or your managed cache TLS port)

Foundry / Azure OpenAI:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION` (optional; defaults are handled in code)

## Repository Notes

- `app/README.md` is the default Vite template README and not the project-level documentation.
- This root README is the source of truth for project intent and architecture.
