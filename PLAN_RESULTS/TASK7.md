# TASK 7 Result — Create Bicep Template to Deploy Azure Static Web App

## Summary
Created a full deployment scaffold under `/devops` for Azure Static Web Apps, targeted to:

- Subscription: `Microsoft Azure Sponsorship 25`
- Resource Group: `rg-github-demo`

## Files Added
- `/devops/main.bicep`
- `/devops/main.parameters.json`
- `/devops/deploy-static-webapp.ps1`
- `/PLAN_RESULTS/TASK7.md`

## What the Bicep Template Provisions

### Resource
- `Microsoft.Web/staticSites`
  - deploys an Azure Static Web App
  - supports `Free` or `Standard` SKU
  - outputs default hostname and resource ID

### Optional app settings
Template supports optional backend settings injection (`includeAppSettings=true`) for:
- Redis (`REDIS_URL`, `AZURE_REDIS_HOST`, `AZURE_REDIS_KEY`, `AZURE_REDIS_PORT`)
- Foundry/Azure OpenAI (`AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`)

## Deployment Script
`/devops/deploy-static-webapp.ps1` performs:
1. subscription selection
2. resource group existence check
3. deployment execution with Bicep template

Defaults in script:
- `SubscriptionName = "Microsoft Azure Sponsorship 25"`
- `ResourceGroupName = "rg-github-demo"`
- `Location = "northeurope"`
- `SkuName = "Free"`

## Validation Performed
- Bicep template compilation (`az bicep build`) completed successfully.

## Deployment Attempt Status
Deployment was executed successfully after updating the location to a supported Static Web Apps region.

Initial attempt with `northeurope` failed with:
- `LocationNotAvailableForResourceType` for `Microsoft.Web/staticSites`

Successful deployment command:
- `./devops/deploy-static-webapp.ps1 -Location westeurope`

Successful deployment result:
- Deployment name: `deploy-swa-20260323-145243`
- Resource group: `rg-github-demo`
- Provisioning state: `Succeeded`
- Static Web App name: `swa-questions-14695`
- Hostname: `brave-cliff-0c1e29b03.2.azurestaticapps.net`
- SKU: `Free`

## Command to Run
From repository root:

```powershell
./devops/deploy-static-webapp.ps1 -Location westeurope
```

Optional (include backend app settings from environment variables):

```powershell
./devops/deploy-static-webapp.ps1 -IncludeAppSettings
```
