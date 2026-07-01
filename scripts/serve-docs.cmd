@echo off
rem Serve the repository over HTTP on port 8000 using Python
pushd "%~dp0\.."
echo Serving repository from %CD% on port 8000
where python >nul 2>&1
if %errorlevel%==0 (
  python -m http.server 8000
) else (
  where py >nul 2>&1
  if %errorlevel%==0 (
    py -3 -m http.server 8000
  ) else (
    echo Python not found. Install Python or use VS Code Live Server.
    pause
  )
)
popd
