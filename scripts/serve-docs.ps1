param(
  [int]$Port = 8000
)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Join-Path $scriptDir '..'
Set-Location $repoRoot
Write-Host "Serving repository from $(Get-Location) on port $Port"
if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server $Port
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    py -3 -m http.server $Port
} else {
    Write-Error "Python not found. Install Python or use VS Code Live Server."
}
