param(
    [Parameter(Mandatory = $true)]
    [string]$Url
)

$ErrorActionPreference = "Stop"

function Get-QueryParameters {
    param([Uri]$Uri)

    $result = @{}
    $query = $Uri.Query.TrimStart("?")
    if ([string]::IsNullOrWhiteSpace($query)) {
        return $result
    }

    foreach ($pair in $query.Split("&")) {
        if ([string]::IsNullOrWhiteSpace($pair)) {
            continue
        }
        $parts = $pair.Split("=", 2)
        $name = [Uri]::UnescapeDataString($parts[0])
        $value = if ($parts.Count -gt 1) { [Uri]::UnescapeDataString($parts[1]) } else { "" }
        $result[$name] = $value
    }
    return $result
}

function Require-Match {
    param(
        [string]$Name,
        [string]$Value,
        [string]$Pattern
    )

    if ([string]::IsNullOrWhiteSpace($Value) -or $Value -notmatch $Pattern) {
        throw "Invalid $Name"
    }
}

$uri = [Uri]$Url
if ($uri.Scheme -ne "onnetpc" -or $uri.Host -ne "stream") {
    throw "Unsupported Onnet PC launcher URL"
}

$installDir = Join-Path $env:LOCALAPPDATA "OnnetPCLauncher"
$configPath = Join-Path $installDir "config.json"
if (-not (Test-Path -LiteralPath $configPath)) {
    throw "Launcher config not found. Re-run install.ps1."
}

$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
$moonlightPath = [string]$config.MoonlightPath
if (-not (Test-Path -LiteralPath $moonlightPath)) {
    throw "Moonlight.exe was not found at: $moonlightPath"
}

$params = Get-QueryParameters -Uri $uri
$hostAddress = [string]$params["host"]
$port = if ($params.ContainsKey("port")) { [string]$params["port"] } else { "47989" }
$app = if ($params.ContainsKey("app")) { [string]$params["app"] } else { "Desktop" }
$resolution = if ($params.ContainsKey("resolution")) { [string]$params["resolution"] } else { "1080p" }
$fps = if ($params.ContainsKey("fps")) { [string]$params["fps"] } else { "60" }
$bitrate = if ($params.ContainsKey("bitrate")) { [string]$params["bitrate"] } else { "8000" }

Require-Match -Name "host" -Value $hostAddress -Pattern "^[A-Za-z0-9.\-]+$"
Require-Match -Name "port" -Value $port -Pattern "^\d{1,5}$"
Require-Match -Name "app" -Value $app -Pattern "^[A-Za-z0-9 ._\-]{1,80}$"
Require-Match -Name "fps" -Value $fps -Pattern "^\d{1,3}$"
Require-Match -Name "bitrate" -Value $bitrate -Pattern "^\d{3,6}$"

$portNumber = [int]$port
if ($portNumber -lt 1 -or $portNumber -gt 65535) {
    throw "Invalid port"
}

$resolutionArg = switch ($resolution.ToLowerInvariant()) {
    "720" { "-720" }
    "720p" { "-720" }
    "1080" { "-1080" }
    "1080p" { "-1080" }
    "1440" { "-1440" }
    "1440p" { "-1440" }
    "4k" { "-4k" }
    "2160" { "-4k" }
    "2160p" { "-4k" }
    default { "-1080" }
}

$endpoint = if ($portNumber -eq 47989) { $hostAddress } else { "${hostAddress}:${portNumber}" }
$args = @("stream", $endpoint, $app, $resolutionArg, "-fps", $fps, "-bitrate", $bitrate)

Start-Process -FilePath $moonlightPath -ArgumentList $args
