param(
    [string]$SunshineBaseUrl = "https://localhost:47990",
    [string]$MySqlClientPath = "mysql.exe",
    [string]$DbHost = "localhost",
    [int]$DbPort = 3306,
    [string]$DbName = "onnetpc",
    [string]$DbUser = "Shiro",
    [string]$DbPassword = "white",
    [int]$PollSeconds = 5,
    [string]$HostName = $env:COMPUTERNAME
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-MySqlQuery {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Query,
        [Parameter(Mandatory = $true)]
        [switch]$ReturnText
    )

    $arguments = @(
        "--protocol=tcp",
        "-h", $DbHost,
        "-P", $DbPort,
        "-u", $DbUser,
        "--password=$DbPassword",
        "--database=$DbName",
        "--batch",
        "--skip-column-names",
        "--raw",
        "-e", $Query
    )

    $output = & $MySqlClientPath @arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "MySQL query failed: $output"
    }

    if ($ReturnText) {
        return ($output | Out-String).Trim()
    }

    return ($output | Out-String).Trim()
}

function Get-NextQueuedAction {
    $query = @"
SELECT id, host_id, action_type, COALESCE(pin, ''), COALESCE(request_note, '')
FROM moonlight_host_actions
WHERE status = 'QUEUED'
ORDER BY id ASC
LIMIT 1;
"@
    $text = Invoke-MySqlQuery -Query $query -ReturnText
    if ([string]::IsNullOrWhiteSpace($text)) {
        return $null
    }

    $parts = $text -split "`t"
    if ($parts.Count -lt 5) {
        return $null
    }

    return [pscustomobject]@{
        Id = [long]$parts[0]
        HostId = [long]$parts[1]
        ActionType = $parts[2]
        Pin = $parts[3]
        RequestNote = $parts[4]
    }
}

function Try-ClaimAction {
    param([long]$ActionId)

    $query = "UPDATE moonlight_host_actions SET status='PROCESSING', updated_at=NOW() WHERE id=$ActionId AND status='QUEUED';"
    $result = Invoke-MySqlQuery -Query $query -ReturnText
    return $true
}

function Get-SunshineClients {
    $endpoint = ($SunshineBaseUrl.TrimEnd('/') + '/api/clients/list')
    $responseText = & curl.exe -k -s $endpoint

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to reach Sunshine client list at $endpoint"
    }

    if ([string]::IsNullOrWhiteSpace($responseText)) {
        return @()
    }

    $responseJson = $responseText | ConvertFrom-Json
    if ($responseJson.status -and $responseJson.named_certs) {
        return @($responseJson.named_certs)
    }

    return @()
}

function Update-HostPairingState {
    param(
        [Parameter(Mandatory = $true)]
        [long]$HostId,
        [string]$ClientUuid,
        [string]$ClientName
    )

    $uuid = if ([string]::IsNullOrWhiteSpace($ClientUuid)) { "NULL" } else { "'" + $ClientUuid.Replace("'", "''") + "'" }
    $name = if ([string]::IsNullOrWhiteSpace($ClientName)) { "NULL" } else { "'" + $ClientName.Replace("'", "''") + "'" }
    $query = "UPDATE sunshine_hosts SET paired_client_uuid=$uuid, paired_client_name=$name, paired_at=NOW(), updated_at=NOW() WHERE id=$HostId;"
    Invoke-MySqlQuery -Query $query | Out-Null
}

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

function Invoke-SunshineUnpairByUuid {
    param([string]$Uuid)

    $endpoint = ($SunshineBaseUrl.TrimEnd('/') + '/api/clients/unpair')
    $payload = @{ uuid = $Uuid } | ConvertTo-Json -Compress
    $responseText = & curl.exe -k -s -X POST $endpoint -H "Content-Type: application/json" -d $payload
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to unpair Sunshine client $Uuid"
    }
    return $responseText
}

function Invoke-SunshineUnpairAll {
    $endpoint = ($SunshineBaseUrl.TrimEnd('/') + '/api/clients/unpair-all')
    $responseText = & curl.exe -k -s -X POST $endpoint -H "Content-Type: application/json"
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to unpair all Sunshine clients"
    }
    return $responseText
}

function Process-QueuedAction {
    param($ActionRow)

    if (-not (Try-ClaimAction -ActionId $ActionRow.Id)) {
        return
    }

    try {
        if ($ActionRow.ActionType -eq 'PAIR') {
            $beforeClients = Get-SunshineClients
            $beforeUuids = @($beforeClients | ForEach-Object { $_.uuid })

            $pairResult = Invoke-SunshinePairing -PairPin $ActionRow.Pin -DeviceName $HostName
            Start-Sleep -Seconds 1

            $afterClients = Get-SunshineClients
            $newClient = $afterClients | Where-Object { $beforeUuids -notcontains $_.uuid } | Select-Object -First 1

            if ($newClient) {
                Update-HostPairingState -HostId $ActionRow.HostId -ClientUuid $newClient.uuid -ClientName $newClient.name
                Invoke-MySqlQuery -Query "UPDATE moonlight_host_actions SET status='SUCCESS', result_text='Pair completed', processed_at=NOW(), updated_at=NOW() WHERE id=$($ActionRow.Id);" | Out-Null
                Write-Host ("Paired Sunshine host {0} with client {1}." -f $ActionRow.HostId, $newClient.uuid)
            } else {
                Invoke-MySqlQuery -Query "UPDATE moonlight_host_actions SET status='FAILED', result_text='Pair succeeded but client UUID could not be detected', processed_at=NOW(), updated_at=NOW() WHERE id=$($ActionRow.Id);" | Out-Null
                Write-Host "Pair succeeded but no new client UUID was detected."
            }
            return
        }

        if ($ActionRow.ActionType -eq 'UNPAIR') {
            $hostRow = Invoke-MySqlQuery -Query "SELECT COALESCE(paired_client_uuid, ''), COALESCE(paired_client_name, '') FROM sunshine_hosts WHERE id=$($ActionRow.HostId) LIMIT 1;" -ReturnText
            $hostParts = $hostRow -split "`t"
            $pairedUuid = if ($hostParts.Count -ge 1) { $hostParts[0] } else { '' }

            if ([string]::IsNullOrWhiteSpace($pairedUuid)) {
                Invoke-MySqlQuery -Query "UPDATE moonlight_host_actions SET status='FAILED', result_text='No paired client uuid available for unpair', processed_at=NOW(), updated_at=NOW() WHERE id=$($ActionRow.Id);" | Out-Null
                return
            }

            $response = Invoke-SunshineUnpairByUuid -Uuid $pairedUuid
            Invoke-MySqlQuery -Query "UPDATE moonlight_host_actions SET status='SUCCESS', result_text='Unpaired client uuid $pairedUuid', processed_at=NOW(), updated_at=NOW() WHERE id=$($ActionRow.Id);" | Out-Null
            Invoke-MySqlQuery -Query "UPDATE sunshine_hosts SET paired_client_uuid=NULL, paired_client_name=NULL, paired_at=NULL, updated_at=NOW() WHERE id=$($ActionRow.HostId);" | Out-Null
            Write-Host ("Unpaired client {0} from host {1}." -f $pairedUuid, $ActionRow.HostId)
            return
        }

        if ($ActionRow.ActionType -eq 'UNPAIR_ALL') {
            $response = Invoke-SunshineUnpairAll
            Invoke-MySqlQuery -Query "UPDATE moonlight_host_actions SET status='SUCCESS', result_text='Unpaired all clients', processed_at=NOW(), updated_at=NOW() WHERE id=$($ActionRow.Id);" | Out-Null
            Invoke-MySqlQuery -Query "UPDATE sunshine_hosts SET paired_client_uuid=NULL, paired_client_name=NULL, paired_at=NULL, updated_at=NOW() WHERE id=$($ActionRow.HostId);" | Out-Null
            Write-Host ("Unpaired all Sunshine clients for host {0}." -f $ActionRow.HostId)
            return
        }

        Invoke-MySqlQuery -Query "UPDATE moonlight_host_actions SET status='FAILED', result_text='Unsupported action type $($ActionRow.ActionType)', processed_at=NOW(), updated_at=NOW() WHERE id=$($ActionRow.Id);" | Out-Null
    } catch {
        $message = $_.Exception.Message.Replace("'", "''")
        Invoke-MySqlQuery -Query "UPDATE moonlight_host_actions SET status='FAILED', result_text='$message', processed_at=NOW(), updated_at=NOW() WHERE id=$($ActionRow.Id);" | Out-Null
        Write-Host $message
    }
}

Write-Host "Polling DB queue at ${DbHost}:${DbPort}/${DbName} using table moonlight_host_actions"

while ($true) {
    try {
        $nextAction = Get-NextQueuedAction
        if ($nextAction) {
            Process-QueuedAction -ActionRow $nextAction
        }
    } catch {
        Write-Host $_.Exception.Message
    }

    Start-Sleep -Seconds $PollSeconds
}