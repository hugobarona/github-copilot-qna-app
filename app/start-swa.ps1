param(
  [switch]$OpenBrowser,
  [string]$NodeVersion = "22.14.0"
)

$ErrorActionPreference = "Stop"

$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $appRoot ".env"
$viteDevServerUrl = "http://localhost:5173"

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    $separator = $line.IndexOf("=")
    if ($separator -lt 1) {
      return
    }

    $name = $line.Substring(0, $separator).Trim()
    $value = $line.Substring($separator + 1).Trim()

    if ($value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

Push-Location $appRoot
try {
  $nodeDir = if ($env:NVM_HOME) {
    Join-Path $env:NVM_HOME ("v{0}" -f $NodeVersion)
  }
  else {
    $null
  }

  if ($nodeDir -and (Test-Path (Join-Path $nodeDir "node.exe"))) {
    Write-Host "Using Node $NodeVersion from $nodeDir for Azure Functions compatibility"
    $env:Path = "$nodeDir;$env:Path"
  }

  [Environment]::SetEnvironmentVariable("FUNCTIONS_WORKER_RUNTIME", "node", "Process")

  $frontendIsRunning = $false
  try {
    $null = Invoke-WebRequest -Uri $viteDevServerUrl -Method Get -TimeoutSec 2
    $frontendIsRunning = $true
  }
  catch {
    $frontendIsRunning = $false
  }

  $openArg = if ($OpenBrowser.IsPresent) { "--open" } else { "" }
  $swaCli = Join-Path $appRoot "node_modules/.bin/swa.cmd"
  $frontendArg = if ($frontendIsRunning) {
    $viteDevServerUrl
  }
  else {
    $viteDevServerUrl
  }

  $runArg = if ($frontendIsRunning) {
    ""
  }
  else {
    "--run 'npm run dev'"
  }

  $command = "& '$swaCli' start $frontendArg --api-location ./api $runArg --host localhost --port 4280 $openArg"
  Invoke-Expression $command
}
finally {
  Pop-Location
}
