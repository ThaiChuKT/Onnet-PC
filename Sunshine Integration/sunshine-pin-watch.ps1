param(
    [string]$SunshineBaseUrl = "https://localhost:47990",
    [string]$InboxPath = (Join-Path $PSScriptRoot "inbox"),
    [string]$ProcessedPath = (Join-Path $PSScriptRoot "processed"),
    [string]$FailedPath = (Join-Path $PSScriptRoot "failed"),
    [string]$Pin,
    [string]$Name = $env:COMPUTERNAME
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-SunshinePairing {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PairPin,
        [Parameter(Mandatory = $true)]
        [string]$DeviceName
    )

    if ($PairPin -notmatch '^\d{4}$') {
        throw "PIN must be exactly 4 digits."
    }

    $endpoint = ($SunshineBaseUrl.TrimEnd('/') + '/api/pin')
    $payload = @{ pin = $PairPin; name = $DeviceName } | ConvertTo-Json -Compress
    $responseText = & curl.exe -k -s -X POST $endpoint -H "Content-Type: application/json" -d $payload

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to reach Sunshine pairing endpoint at $endpoint"
    }

    if ([string]::IsNullOrWhiteSpace($responseText)) {
        throw "Sunshine returned an empty response from $endpoint"
    }

    $responseJson = $responseText | ConvertFrom-Json
    if (-not $responseJson.status) {
        throw "Sunshine rejected the PIN: $responseText"
    }

    return $responseJson
}

function Process-PinFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath
    )

    $jsonText = Get-Content -LiteralPath $FilePath -Raw
    $request = $jsonText | ConvertFrom-Json
    $pairPin = [string]$request.pin
    $deviceName = if ([string]::IsNullOrWhiteSpace([string]$request.name)) { $Name } else { [string]$request.name }

    $result = Invoke-SunshinePairing -PairPin $pairPin -DeviceName $deviceName

    $targetDirectory = $ProcessedPath
    if (-not (Test-Path -LiteralPath $targetDirectory)) {
        New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    }

    $targetPath = Join-Path $targetDirectory ([IO.Path]::GetFileNameWithoutExtension($FilePath) + ".paired.json")
    Move-Item -LiteralPath $FilePath -Destination $targetPath -Force
    Write-Host ("Paired device {0} with PIN {1}." -f $deviceName, $pairPin)
    return $result
}

function Start-PinWatch {
    if (-not (Test-Path -LiteralPath $InboxPath)) {
        New-Item -ItemType Directory -Path $InboxPath -Force | Out-Null
    }

    if (-not (Test-Path -LiteralPath $ProcessedPath)) {
        New-Item -ItemType Directory -Path $ProcessedPath -Force | Out-Null
    }

    if (-not (Test-Path -LiteralPath $FailedPath)) {
        New-Item -ItemType Directory -Path $FailedPath -Force | Out-Null
    }

    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $InboxPath
    $watcher.Filter = "*.json"
    $watcher.IncludeSubdirectories = $false
    $watcher.EnableRaisingEvents = $true

    Register-ObjectEvent -InputObject $watcher -EventName Created -SourceIdentifier "SunshinePinCreated" | Out-Null

    Write-Host 'Watching ' $InboxPath ' for JSON pin requests. Drop files like {"pin":"1234","name":"PC name"}.'
    Write-Host "Sunshine pairing endpoint: $SunshineBaseUrl/api/pin"

    while ($true) {
        $event = Wait-Event -SourceIdentifier "SunshinePinCreated"
        if (-not $event) {
            continue
        }

        try {
            $path = [string]$event.SourceEventArgs.FullPath
            if (Test-Path -LiteralPath $path) {
                Process-PinFile -FilePath $path | Out-Null
            }
        } catch {
            $failedName = Join-Path $FailedPath (([IO.Path]::GetFileNameWithoutExtension([string]$event.SourceEventArgs.FullPath)) + ".failed.json")
            if (Test-Path -LiteralPath [string]$event.SourceEventArgs.FullPath) {
                Move-Item -LiteralPath ([string]$event.SourceEventArgs.FullPath) -Destination $failedName -Force
            }
            Write-Host $_.Exception.Message
        } finally {
            Remove-Event -EventIdentifier $event.EventIdentifier -ErrorAction SilentlyContinue
        }
    }
}

if (-not [string]::IsNullOrWhiteSpace($Pin)) {
    $result = Invoke-SunshinePairing -PairPin $Pin -DeviceName $Name
    $result | ConvertTo-Json -Depth 4
    return
}

Start-PinWatch