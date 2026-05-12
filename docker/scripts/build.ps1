#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$context = Split-Path $PSScriptRoot -Parent

Write-Host "Building dev-base..."
docker build -f "$context\Dockerfile.base" -t dev-base:latest $context

Write-Host "Building dev-claude..."
docker build -f "$context\Dockerfile.claude" -t dev-claude:latest $context

Write-Host "Building dev-env..."
docker build -f "$context\Dockerfile.dev" -t dev-env:latest $context

Write-Host "All images built."
Write-Host ""
Write-Host "Usage:"
Write-Host "  Copy .env.example to .env and fill in your values, then:"
Write-Host "  docker compose run --rm dev"
