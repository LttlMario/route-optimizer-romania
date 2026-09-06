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
if ($sw -notmatch 'tile\.openstreetmap\.org') { throw 'Service worker fără cache pentru dalele OpenStreetMap.' }
$htmlChecks = @{
  'index.html' = @('start-address', 'end-address', 'optimize', 'road-avoidance')
  'routes.html' = @('delivery-list', 'route-map', 'navigate-next', 'complete-next')
  'completed.html' = @('history-list', 'history-filter', 'export-history', 'clear-history')
}
foreach ($entry in $htmlChecks.GetEnumerator()) {
  $html = Get-Content -Raw $entry.Key
  foreach ($id in $entry.Value) { if ($html -notmatch ('id="' + $id + '"')) { throw "Lipsește controlul #$id din $($entry.Key)" } }
}
if ((Get-Content -Raw storage.js) -notmatch 'getActiveSnapshot') { throw 'IndexedDB fără recuperarea checkpoint-ului activ.' }
if ((Get-Content -Raw app.js) -notmatch 'invalidateOptimization') { throw 'Optimizerul nu invalidează ruta după modificări.' }
if ((Get-Content -Raw completed.js) -notmatch 'export-history') { throw 'Istoricul nu are exportul CSV.' }
if ((Get-Content -Raw routes.js) -notmatch "\$\('#complete-next'\)\?\.addEventListener") { throw 'Butonul pentru următorul stop nu are handler.' }
if ((Get-Content -Raw app.js) -notmatch 'result\[result\.length - 1\] = endIndex') { throw 'Optimizerul nu fixează Finish-ul la final.' }
if ((Get-Content -Raw app.js) -notmatch 'fetchWithTimeout') { throw 'Rutarea OSRM nu are timeout.' }
if ((Get-Content -Raw app.js) -notmatch 'candidateScore') { throw 'Optimizerul nu folosește scorarea ferestrelor orare.' }
if ((Get-Content -Raw storage.js) -notmatch '!data\?\.start.*data\?\.stops') { throw 'Checkpoint-ul zilnic nu este protejat la golire.' }
foreach ($provider in @('google', 'apple', 'waze')) { if ((Get-Content -Raw routes.js) -notmatch $provider) { throw "Navigarea $provider lipsește." } }
Write-Host 'Smoke check trecut: fișiere, JavaScript și PWA valide.' -ForegroundColor Green
if ((Get-Content -Raw routes.html) -notmatch 'share-route') { throw 'Butonul de distribuire lipsește.' }
if ((Get-Content -Raw routes.js) -notmatch '#share-route') { throw 'Butonul de distribuire nu are handler.' }
if ((Get-Content -Raw routes.js) -notmatch 'navigator\.share' -or (Get-Content -Raw routes.js) -notmatch 'clipboard\.writeText') { throw 'Distribuirea nu are Web Share și fallback clipboard.' }
