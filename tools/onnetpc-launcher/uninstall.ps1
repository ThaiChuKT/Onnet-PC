$ErrorActionPreference = "Stop"

Remove-Item -Path "HKCU:\Software\Classes\onnetpc" -Recurse -Force -ErrorAction SilentlyContinue

$installDir = Join-Path $env:LOCALAPPDATA "OnnetPCLauncher"
Remove-Item -LiteralPath $installDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Onnet PC Launcher uninstalled."
