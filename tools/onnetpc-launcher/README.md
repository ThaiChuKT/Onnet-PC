# Onnet PC Launcher

This Windows helper registers the `onnetpc://` URL protocol and controls Moonlight locally.

Install from PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
.\install.ps1
```

Default Moonlight path:

```text
C:\Program Files\Moonlight Game Streaming\Moonlight.exe
```

After install, the web app can open URLs like:

```text
onnetpc://stream?host=58.187.67.90&port=47989&app=Desktop&resolution=1080p&fps=60&bitrate=8000
```

To disconnect the current Moonlight stream when a session ends, the web app opens:

```text
onnetpc://stop?host=58.187.67.90&port=47989
```

If no host is supplied, the launcher closes Moonlight processes launched from the configured Moonlight path.

Uninstall:

```powershell
.\uninstall.ps1
```
