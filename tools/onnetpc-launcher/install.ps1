param(
    [string]$MoonlightPath = "C:\Program Files\Moonlight Game Streaming\Moonlight.exe"
)

$ErrorActionPreference = "Stop"

$launcherPath = Join-Path $PSScriptRoot "launcher.ps1"
if (-not (Test-Path -LiteralPath $launcherPath)) {
    throw "launcher.ps1 was not found next to install.ps1"
}

if (-not (Test-Path -LiteralPath $MoonlightPath)) {
    throw "Moonlight.exe was not found at: $MoonlightPath"
}

$installDir = Join-Path $env:LOCALAPPDATA "OnnetPCLauncher"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

$installedLauncher = Join-Path $installDir "launcher.ps1"
Copy-Item -LiteralPath $launcherPath -Destination $installedLauncher -Force

$config = @{
    MoonlightPath = $MoonlightPath
} | ConvertTo-Json
$config | Set-Content -LiteralPath (Join-Path $installDir "config.json") -Encoding UTF8

$protocolKey = "HKCU:\Software\Classes\onnetpc"
$commandKey = Join-Path $protocolKey "shell\open\command"
New-Item -Force -Path $commandKey | Out-Null
Set-Item -Path $protocolKey -Value "URL:Onnet PC Launcher"
New-ItemProperty -Path $protocolKey -Name "URL Protocol" -Value "" -PropertyType String -Force | Out-Null

$command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$installedLauncher`" `"%1`""
Set-Item -Path $commandKey -Value $command

Write-Host "Onnet PC Launcher installed."
Write-Host "Protocol: onnetpc://"
Write-Host "Moonlight: $MoonlightPath"
