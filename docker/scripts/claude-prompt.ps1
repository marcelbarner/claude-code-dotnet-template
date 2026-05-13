# Usage: .\claude-prompt.ps1 -Prompt "refactor the auth service"
#        .\claude-prompt.ps1 -Prompt "fix issue #42" -Model "claude-opus-4-7"
#        .\claude-prompt.ps1 -Prompt "fix issue #42" -Keep
# Starts a detached container; view output via Docker Desktop logs.
# Without -Keep the container is removed automatically after exit.

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$Prompt,

    [Parameter(Mandatory = $false)]
    [string]$Model = "",

    [Parameter(Mandatory = $false)]
    [switch]$Keep
)

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile    = Resolve-Path (Join-Path $ScriptDir ".." ".env")
$Id         = "claude-$(Get-Date -Format 'yyyyMMddHHmmss')-$(Get-Random -Maximum 9999)"

$runArgs = @("run", "-d", "--name", $Id, "--env-file", $EnvFile)

if (-not $Keep) {
    $runArgs += "--rm"
}

$runArgs += @("dev-env:latest", "claude", "-p", $Prompt, "--output-format", "stream-json", "--verbose")

if ($Model -ne "") {
    $runArgs += "--model"
    $runArgs += $Model
}

Write-Host "[$Id] started"
docker @runArgs | Out-Null

if ($Keep) {
    Write-Host "  logs   : docker logs -f $Id"
    Write-Host "  remove : docker rm $Id"
}
