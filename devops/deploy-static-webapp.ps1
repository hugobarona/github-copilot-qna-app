param(
  [string]$SubscriptionName = "Microsoft Azure Sponsorship 25",
  [string]$ResourceGroupName = "rg-github-demo",
  [string]$Location = "northeurope",
  [ValidateSet("Free", "Standard")]
  [string]$SkuName = "Free",
  [string]$StaticWebAppName = ("swa-questions-{0}" -f (Get-Random -Minimum 10000 -Maximum 99999)),
  [switch]$IncludeAppSettings
)

$ErrorActionPreference = "Stop"

Write-Host "Using subscription: $SubscriptionName"
Write-Host "Using resource group: $ResourceGroupName"
Write-Host "Deploying static web app: $StaticWebAppName"

az account set --subscription $SubscriptionName

# Validate resource group exists before deployment.
az group show --name $ResourceGroupName --query name --output tsv | Out-Null

$parameters = @(
  "staticWebAppName=$StaticWebAppName",
  "location=$Location",
  "skuName=$SkuName",
  "includeAppSettings=$($IncludeAppSettings.IsPresent.ToString().ToLower())"
)

if ($IncludeAppSettings.IsPresent) {
  $parameters += "azureRedisHost=$env:AZURE_REDIS_HOST"
  $parameters += "azureRedisKey=$env:AZURE_REDIS_KEY"
  $parameters += "azureRedisPort=$env:AZURE_REDIS_PORT"
  $parameters += "redisUrl=$env:REDIS_URL"
  $parameters += "azureOpenAiEndpoint=$env:AZURE_OPENAI_ENDPOINT"
  $parameters += "azureOpenAiApiKey=$env:AZURE_OPENAI_API_KEY"
  $parameters += "azureOpenAiDeployment=$env:AZURE_OPENAI_DEPLOYMENT"
  $parameters += "azureOpenAiApiVersion=$env:AZURE_OPENAI_API_VERSION"
}

az deployment group create `
  --subscription $SubscriptionName `
  --resource-group $ResourceGroupName `
  --name ("deploy-swa-{0}" -f (Get-Date -Format "yyyyMMdd-HHmmss")) `
  --template-file "./devops/main.bicep" `
  --parameters @parameters `
  --output table

Write-Host "Deployment command completed."
