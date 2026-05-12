# Usage: .\claude-prompt.ps1 -Prompt "refactor the auth service"
#        .\claude-prompt.ps1 -Prompt "fix issue #42" -Model "claude-opus-4-7"
# Each call starts an isolated container that is removed on exit.

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$Prompt,

    [Parameter(Mandatory = $false)]
    [string]$Model = ""
)

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile    = Resolve-Path (Join-Path $ScriptDir ".." ".env")
$Id         = "claude-$(Get-Date -Format 'yyyyMMddHHmmss')-$(Get-Random -Maximum 9999)"

$runArgs = @("run", "--name", $Id, "--env-file", $EnvFile, "dev-env:latest", "claude", "-p", $Prompt)

if ($Model -ne "") {
    $runArgs += "--model"
    $runArgs += $Model
}

Write-Host "[$Id] starting (container kept after exit for inspection)"
docker @runArgs
Write-Host "[$Id] done — inspect with: docker logs $Id | docker rm $Id"
