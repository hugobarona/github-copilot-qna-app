targetScope = 'resourceGroup'

@description('Globally unique Azure Static Web App name.')
param staticWebAppName string

@description('Azure region for the Static Web App resource.')
param location string = resourceGroup().location

@allowed([
  'Free'
  'Standard'
])
@description('Static Web App SKU.')
param skuName string = 'Free'

@description('Set true to configure backend app settings during deployment.')
param includeAppSettings bool = false

@secure()
@description('Optional Redis URL connection string.')
param redisUrl string = ''

@secure()
@description('Optional Azure Redis host.')
param azureRedisHost string = ''

@secure()
@description('Optional Azure Redis key.')
param azureRedisKey string = ''

@description('Optional Azure Redis TLS port.')
param azureRedisPort string = '6380'

@secure()
@description('Optional Foundry/Azure OpenAI endpoint.')
param azureOpenAiEndpoint string = ''

@secure()
@description('Optional Foundry/Azure OpenAI API key.')
param azureOpenAiApiKey string = ''

@description('Optional Foundry/Azure OpenAI deployment name.')
param azureOpenAiDeployment string = ''

@description('Optional Foundry API version override.')
param azureOpenAiApiVersion string = '2024-10-21'

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: skuName
    tier: skuName
  }
  properties: {}
}

resource staticWebAppAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = if (includeAppSettings) {
  name: 'appsettings'
  parent: staticWebApp
  properties: {
    REDIS_URL: redisUrl
    AZURE_REDIS_HOST: azureRedisHost
    AZURE_REDIS_KEY: azureRedisKey
    AZURE_REDIS_PORT: azureRedisPort
    AZURE_OPENAI_ENDPOINT: azureOpenAiEndpoint
    AZURE_OPENAI_API_KEY: azureOpenAiApiKey
    AZURE_OPENAI_DEPLOYMENT: azureOpenAiDeployment
    AZURE_OPENAI_API_VERSION: azureOpenAiApiVersion
  }
}

output staticWebAppId string = staticWebApp.id
output staticWebAppNameOutput string = staticWebApp.name
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
