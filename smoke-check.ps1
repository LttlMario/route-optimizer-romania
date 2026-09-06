$ErrorActionPreference = 'Stop'
$required = @('index.html', 'routes.html', 'completed.html', 'app.js', 'routes.js', 'completed.js', 'storage.js', 'sw.js', 'manifest.json')
foreach ($file in $required) {
  if (-not (Test-Path -LiteralPath $file)) { throw "Lipsește fișierul obligatoriu: $file" }
}
foreach ($script in @('app.js', 'routes.js', 'completed.js', 'storage.js')) {
  node --check $script
  if ($LASTEXITCODE -ne 0) { throw "Sintaxă invalidă în $script" }
}
$manifest = Get-Content -Raw manifest.json | ConvertFrom-Json
if (-not $manifest.name -or -not $manifest.start_url -or -not $manifest.icons) { throw 'Manifest PWA incomplet.' }
$sw = Get-Content -Raw sw.js
if ($sw -notmatch "CACHE_NAME") { throw 'Service worker fără cache configurat.' }
$htmlChecks = @{
  'index.html' = @('start-address', 'end-address', 'optimize', 'road-avoidance')
  'routes.html' = @('delivery-list', 'route-map', 'navigate-next', 'complete-next')
  'completed.html' = @('history-list', 'history-filter', 'clear-history')
}
foreach ($entry in $htmlChecks.GetEnumerator()) {
  $html = Get-Content -Raw $entry.Key
  foreach ($id in $entry.Value) { if ($html -notmatch "id=\"$id\"") { throw "Lipsește controlul #$id din $($entry.Key)" } }
}
Write-Host 'Smoke check trecut: fișiere, JavaScript și PWA valide.' -ForegroundColor Green
