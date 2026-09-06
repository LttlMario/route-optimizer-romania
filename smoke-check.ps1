$ErrorActionPreference = 'Stop'
$required = @('index.html', 'routes.html', 'completed.html', 'app.js', 'routes.js', 'completed.js', 'storage.js', 'sw.js', 'manifest.json', 'leaflet.js', 'leaflet.css')
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
if ((Get-Content -Raw index.html) -notmatch 'src="\./leaflet\.js"' -or (Get-Content -Raw routes.html) -notmatch 'src="\./leaflet\.js"') { throw 'Paginile nu folosesc biblioteca Leaflet locală.' }
$htmlChecks = @{
  'index.html' = @('start-address', 'end-address', 'optimize', 'road-avoidance', 'break-after', 'break-duration', 'blocked-roads', 'vehicle-capacity')
  'routes.html' = @('delivery-list', 'route-map', 'navigate-next', 'complete-next', 'wake-lock', 'add-delay')
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
if ((Get-Content -Raw app.js) -notmatch 'fetchRoutingWithRetry') { throw 'Rutarea OSRM nu are retry.' }
if ((Get-Content -Raw app.js) -notmatch 'approximateDurationMatrix' -or (Get-Content -Raw app.js) -notmatch 'approximateRoute') { throw 'Fallback-ul local pentru rutare lipsește.' }
if ((Get-Content -Raw app.js) -notmatch 'candidateScore') { throw 'Optimizerul nu folosește scorarea ferestrelor orare.' }
if ((Get-Content -Raw app.js) -notmatch 'plannedBreakMinutes') { throw 'Pauzele automate nu sunt incluse în durata rutei.' }
if ((Get-Content -Raw app.js) -notmatch 'blockedRoadMatch') { throw 'Străzile blocate nu sunt detectate în stopuri.' }
if ((Get-Content -Raw app.js) -notmatch 'state\.routeGeometry\) state\.routeLayer = L\.geoJSON') { throw 'Traseul salvat nu este restaurat pe hartă.' }
$appSource = Get-Content -Raw app.js
if (([regex]::Matches($appSource, 'const departureValue')).Count -gt 1) { throw 'calculateRoute declară departureValue de mai multe ori.' }
if (([regex]::Matches($appSource, 'let elapsedMinutes = 0')).Count -gt 1) { throw 'calculateRoute declară elapsedMinutes de mai multe ori.' }
if ((Get-Content -Raw app.js) -notmatch 'optimizationMatrix' -or (Get-Content -Raw app.js) -notmatch 'annotations=duration,distance') { throw 'Modul de optimizare pe distanță lipsește.' }
if ((Get-Content -Raw app.js) -notmatch 'cleanPoint' -or (Get-Content -Raw app.js) -notmatch 'cleanStops') { throw 'Sanitizarea coordonatelor restaurate lipsește.' }
if ((Get-Content -Raw storage.js) -notmatch '!data\?\.start.*data\?\.stops') { throw 'Checkpoint-ul zilnic nu este protejat la golire.' }
foreach ($provider in @('google', 'apple', 'waze')) { if ((Get-Content -Raw routes.js) -notmatch $provider) { throw "Navigarea $provider lipsește." } }
Write-Host 'Smoke check trecut: fișiere, JavaScript și PWA valide.' -ForegroundColor Green
if ((Get-Content -Raw routes.html) -notmatch 'share-route') { throw 'Butonul de distribuire lipsește.' }
if ((Get-Content -Raw routes.js) -notmatch '#share-route') { throw 'Butonul de distribuire nu are handler.' }
if ((Get-Content -Raw routes.js) -notmatch 'popupContent') { throw 'Harta nu are popup-uri sigure pentru pinuri.' }
if ((Get-Content -Raw routes.js) -notmatch 'navigator\.share' -or (Get-Content -Raw routes.js) -notmatch 'clipboard\.writeText') { throw 'Distribuirea nu are Web Share și fallback clipboard.' }
if ((Get-Content -Raw routes.js) -notmatch 'visibilitychange.*recalculateRemainingEta') { throw 'ETA nu se recalculează la revenirea în prim-plan.' }
if ((Get-Content -Raw app.js) -notmatch 'data-move-to' -or (Get-Content -Raw app.js) -notmatch 'data-swap' -or (Get-Content -Raw app.js) -notmatch 'position-input') { throw 'Editorul avansat al stopurilor este incomplet.' }
if ((Get-Content -Raw routes.js) -notmatch 'pageshow.*recalculateRemainingEta') { throw 'ETA nu se reîncarcă la restaurarea paginii.' }
if ((Get-Content -Raw routes.js) -match 'window\.alert\(message\)') { throw 'GPS folosește o alertă blocantă.' }
if ((Get-Content -Raw routes.js) -notmatch 'function setStatus') { throw 'Pagina de livrare nu are status inline.' }
if ((Get-Content -Raw routes.js) -notmatch 'aria-label.*Marchează stopul' -or (Get-Content -Raw routes.js) -notmatch 'aria-label.*Navighează către Finish') { throw 'Butoanele de livrare nu au etichete accesibile.' }
if ((Get-Content -Raw routes.js) -notmatch 'aria-label.*urmărirea GPS') { throw 'Butonul GPS nu are etichetă accesibilă.' }
if ((Get-Content -Raw app.js) -notmatch 'response\.status === 429') { throw 'Geocoderul nu tratează limitarea Nominatim.' }
if ((Get-Content -Raw app.js) -notmatch 'navigator\.onLine === false') { throw 'Geocoderul nu are mesaj offline.' }
if ((Get-Content -Raw app.js) -notmatch 'OCR-ul nu este încă disponibil offline') { throw 'Scanarea OCR offline nu are mesaj clar.' }
if ((Get-Content -Raw routes.js) -notmatch 'pagehide.*stopLocationWatch') { throw 'GPS watch nu se oprește la pagehide.' }
if ((Get-Content -Raw routes.js) -notmatch 'courierMarker\.remove\(\)') { throw 'Markerul GPS nu este curățat.' }
if ((Get-Content -Raw routes.js) -notmatch 'error\?\.code === 1' -or (Get-Content -Raw routes.js) -notmatch 'error\?\.code === 3') { throw 'Erorile GPS nu au mesaje diferențiate.' }
if ((Get-Content -Raw routes.html) -notmatch 'id="status"') { throw 'Pagina routes nu are status inline.' }
if ((Get-Content -Raw routes.js) -notmatch 'hasOwnProperty\.call\(STATUS_LABELS') { throw 'Statusurile de livrare nu sunt validate.' }
if ((Get-Content -Raw routes.js) -notmatch 'function isProcessed') { throw 'Stopurile cu status nu sunt tratate ca procesate.' }
if ((Get-Content -Raw routes.js) -match 'const node = #|const requestedStatus = #') { throw 'Pagina de livrare conține selectori JavaScript invalizi.' }
if ((Get-Content -Raw routes.js) -notmatch 'wakeLock') { throw 'Pagina de livrare nu are menținerea ecranului activ.' }
if ((Get-Content -Raw routes.js) -notmatch 'historyKey') { throw 'Istoricul nu identifică unic stopurile dintr-o rută.' }
if ((Get-Content -Raw storage.js) -notmatch 'existing\.filter\(\(item\) => item\.historyKey') { throw 'IndexedDB nu actualizează intrările duplicate din istoric.' }
if ((Get-Content -Raw routes.js) -notmatch 'function refreshLiveDelay\(\) \{ recalculateRemainingEta\(\)') { throw 'ETA live nu se recalculează periodic.' }
if ((Get-Content -Raw routes.js) -notmatch 'function addRouteDelay') { throw 'Întârzierea manuală nu actualizează ETA.' }
if ((Get-Content -Raw routes.html) -notmatch 'next-stop-address[^>]*aria-live="polite"') { throw 'Următorul stop nu are anunț accesibil.' }
if ((Get-Content -Raw routes.js) -notmatch 'setInterval\(\(\) => save\(\), 30000\)') { throw 'Ruta nu are autosalvare periodică.' }
if ((Get-Content -Raw storage.js) -notmatch 'db\.close\(\)') { throw 'IndexedDB nu închide conexiunile după scriere.' }
if ((Get-Content -Raw storage.js) -notmatch 'db\.close\(\); resolve') { throw 'IndexedDB nu închide conexiunile după citire.' }

if ((Get-Content -Raw routes.js) -notmatch 'completeButton\.hidden = !next') { throw 'Butonul de livrare nu se ascunde pentru Finish.' }

if ((Get-Content -Raw app.js) -notmatch 'function exactOrder') { throw 'Optimizarea exactă pentru rute mici lipsește.' }

if ((Get-Content -Raw app.js) -notmatch 'function getTrafficFactor') { throw 'Factorul automat de trafic lipsește.' }
if ((Get-Content -Raw index.html) -notmatch 'value=.*auto') { throw 'Modul automat de trafic lipsește.' }

if ((Get-Content -Raw app.js) -notmatch 'const previous = editIndex') { throw 'Editarea stopului nu păstrează setările existente.' }

if ((Get-Content -Raw app.js) -notmatch 'const serviceValue') { throw 'Editarea nu permite setarea staționării la zero.' }

if ((Get-Content -Raw routes.js) -notmatch 'close-status-modal.*delivery-status-modal.*hidden = true') { throw 'Închiderea ferestrei de status nu ascunde modalul.' }

if ((Get-Content -Raw routes.js) -notmatch 'arrivalAt = stop.arrivalAt.*save\(\)') { throw 'Ora de sosire nu se salvează la deschiderea livrării.' }

if ((Get-Content -Raw app.js) -notmatch 'async function waitForGeocoder') { throw 'Limitarea cererilor Nominatim lipsește.' }

if ((Get-Content -Raw routes.js) -notmatch 'keydown.*Escape') { throw 'Închiderea rapidă cu Escape lipsește.' }

if ((Get-Content -Raw app.js) -notmatch 'packageCount') { throw 'Numărul de colete nu este implementat.' }
if ((Get-Content -Raw app.js) -notmatch 'Capacitatea vehiculului este depășită') { throw 'Validarea capacității lipsește.' }
