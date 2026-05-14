# Sunshine Integration Helper

This folder contains a host-side pairing helper for Sunshine on Windows.

## What it does

Sunshine exposes a local pairing API at `https://localhost:47990/api/pin` and an unpair API at `https://localhost:47990/api/clients/unpair`.
The helper script polls the Onnet-PC database for queued pairing and unpairing jobs, then submits them to Sunshine locally.

## Files

- `sunshine-pin-watch.ps1`: polls the MySQL queue table and forwards jobs to Sunshine.
- `run-sunshine-pin-watch.bat`: convenience launcher for the watcher.

## One-shot usage

The helper expects the same local database values used by Onnet-PC:

- Host: `localhost`
- Port: `3306`
- Database: `onnetpc`
- User: `Shiro`
- Password: `white`

Run the script directly if you want it to poll the queue now:

```powershell
powershell -ExecutionPolicy Bypass -File .\sunshine-pin-watch.ps1
```

## Queue usage

1. Launch `run-sunshine-pin-watch.bat` on the Sunshine host PC.
2. When Onnet-PC queues a `PAIR` action, the helper sends the PIN to Sunshine and stores the paired client UUID back on the host row.
3. When a subscription expires or a session ends, Onnet-PC queues an `UNPAIR` job for that host.
4. If the paired client UUID is missing, the helper falls back to `UNPAIR_ALL` only when the backend explicitly queued that action.

## Notes

- The script uses Sunshine's local web UI endpoint, so no manual typing is needed on the host.
- The helper keeps the database as the source of truth for pairing state.
- The script ignores the local Sunshine certificate because the web UI uses a self-signed localhost cert.