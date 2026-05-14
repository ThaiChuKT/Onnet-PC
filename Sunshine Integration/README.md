# Sunshine Integration Helper

This folder contains a host-side pairing helper for Sunshine on Windows.

## What it does

Sunshine exposes a local pairing API at `https://localhost:47990/api/pin`.
The helper script submits the Moonlight PIN to that API so you do not have to type it in the Sunshine web UI.

## Files

- `sunshine-pin-watch.ps1`: watches an `inbox` folder for JSON pin requests and forwards them to Sunshine.
- `run-sunshine-pin-watch.bat`: convenience launcher for the watcher.

## One-shot usage

Run the script directly if you already have the PIN:

```powershell
powershell -ExecutionPolicy Bypass -File .\sunshine-pin-watch.ps1 -Pin 1234 -Name "My PC"
```

## Watcher usage

1. Launch `run-sunshine-pin-watch.bat` on the Sunshine host PC.
2. Drop a file into `inbox` with this shape:

```json
{ "pin": "1234", "name": "My PC" }
```

3. The script posts the PIN to Sunshine and moves the file into `processed`.
4. Failed requests are moved into `failed`.

## Notes

- The script uses Sunshine's local web UI endpoint, so no manual typing is needed on the host.
- The default device name is the host computer name.
- The script ignores the local Sunshine certificate because the web UI uses a self-signed localhost cert.