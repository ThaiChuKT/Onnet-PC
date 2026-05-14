# Moonlight + Sunshine Integration for Onnet-PC

## Scope

This integration uses Sunshine as host service and Moonlight as client.
Onnet-PC manages Sunshine hosts from the web dashboard and can execute Moonlight CLI commands from backend (Option B).
Pair and unpair coordination now goes through the Onnet-PC database queue so a helper on the Sunshine host can perform the local Sunshine API calls automatically.

Current test host provided: 'ip'

## What is implemented

### Backend API

Admin endpoints (admin-auth only):
- `GET /api/v1/admin/moonlight/hosts`
- `POST /api/v1/admin/moonlight/hosts`
- `PATCH /api/v1/admin/moonlight/hosts/{hostId}`
- `DELETE /api/v1/admin/moonlight/hosts/{hostId}`
- `POST /api/v1/admin/moonlight/hosts/{hostId}/commands`
- `GET /api/v1/admin/moonlight/hosts/{hostId}/commands`

Authenticated user endpoints:
- `GET /api/v1/moonlight/hosts`
- `POST /api/v1/moonlight/hosts/{hostId}/launch`

### Backend behavior

- Stores Sunshine hosts in database table `sunshine_hosts`.
- Stores queued host actions in `moonlight_host_actions`.
- Stores Moonlight command execution logs in `moonlight_command_logs`.
- Supports command actions:
  - `PROBE` -> `moonlight list <host>`
  - `PAIR` -> `moonlight pair <host> [--pin <pin>]`
  - `STREAM` -> `moonlight stream <host> [options]`
<<<<<<< Updated upstream
- Can prepare command only (copy command flow), or execute on server (`executeOnServer=true`) if enabled.
=======
- Can prepare command only (copy command flow), execute PROBE/STREAM on the backend when enabled, or queue PAIR in the database for the Sunshine host helper.
- When a booking/session ends, the backend queues an `UNPAIR` job for the paired Sunshine client if one is known.
>>>>>>> Stashed changes

### Frontend behavior

Admin dashboard page:
- Path: `/dashboard/sunshine`
- Features:
  - Add Sunshine host
  - Delete host
  - Select command profile (PROBE/PAIR/STREAM + resolution/fps)
  - Copy prepared Moonlight command
  - Run command on server, which now queues PAIR jobs into the database for the Sunshine host helper
  - View recent command logs

## Database changes

New SQL migration file:
- `database/sql/migration_add_moonlight_sunshine_tables.sql`
- `database/sql/migration_add_moonlight_host_actions.sql`

This migration creates:
- `sunshine_hosts`
- `moonlight_host_actions`
- `moonlight_command_logs`

It also seeds the provided host `ip` if not already present.

## Required backend config for Option B

Add these properties to `src/main/resources/application.properties` (or env overrides):

```properties
app.moonlight.cli.enabled=true
app.moonlight.cli.path=moonlight
app.moonlight.cli.timeout-seconds=25
app.moonlight.cli.allow-stream-command=false
```

Notes:
- Set `app.moonlight.cli.path` to full executable path if `moonlight` is not in PATH.
- Keep `allow-stream-command=false` unless you intentionally want backend machine to start stream sessions.

## What you need to provide / do

1. Install Moonlight CLI on the backend machine (the machine running Spring Boot API).
2. Ensure backend can reach Sunshine host `ip` over required ports.
3. Run SQL migration file against your `onnetpc` database.
4. Enable config flags above and restart backend.
5. Sign in as admin and use `/dashboard/sunshine`.
<<<<<<< Updated upstream
=======
6. For `PAIR`, copy the PIN shown by Moonlight into the dashboard before running the command. The host helper will pick it up from the queue.
>>>>>>> Stashed changes

## Recommended first validation

1. Add or confirm host `ip` in dashboard.
2. Run `PROBE` with server execution enabled.
3. Check command log output in dashboard.
4. Run `PAIR` when someone can accept pairing on Sunshine host.
5. Use `Copy command` for client-side execution if server execution is disabled.
