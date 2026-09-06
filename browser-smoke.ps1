param(
  [string]$BaseUrl = ''
)
$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($BaseUrl)) { $BaseUrl = ([uri](Get-Item -LiteralPath 'index.html').Directory.FullName).AbsoluteUri }
$chromeCandidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)
$chrome = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $chrome) { throw 'Google Chrome nu a fost găsit pentru testul headless.' }
$tempRoot = Join-Path $env:TEMP ('route-optimizer-browser-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot | Out-Null
try {
  $cases = @(
    @{ Name = 'desktop'; Url = ($BaseUrl.TrimEnd('/') + '/index.html'); Size = '1440,1000'; Checks = @('vehicle-capacity', 'feasibility-report', 'review-route') },
    @{ Name = 'mobile'; Url = ($BaseUrl.TrimEnd('/') + '/index.html'); Size = '390,844'; Checks = @('vehicle-capacity', 'feasibility-report', 'review-route') },
    @{ Name = 'routes-mobile'; Url = ($BaseUrl.TrimEnd('/') + '/routes.html'); Size = '390,844'; Checks = @('delivery-list', 'route-map', 'navigate-next', 'complete-next') }
    @{ Name = 'settings-mobile'; Url = ($BaseUrl.TrimEnd('/') + '/settings.html'); Size = '390,844'; Checks = @('setting-navigation', 'export-settings-backup', 'diagnostic-list') },
    @{ Name = 'saved-mobile'; Url = ($BaseUrl.TrimEnd('/') + '/saved.html'); Size = '390,844'; Checks = @('saved-routes-list', 'saved-empty') }
  )
  foreach ($case in $cases) {
    $output = Join-Path $tempRoot ($case.Name + '.html')
    $nativePreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $dom = & $chrome '--headless=new' '--disable-gpu' '--no-sandbox' '--hide-scrollbars' ('--window-size=' + $case.Size) '--virtual-time-budget=5000' '--dump-dom' ('--user-data-dir=' + (Join-Path $tempRoot $case.Name)) $case.Url 2>&1 | Out-String
    Set-Content -Path $output -Value $dom -Encoding UTF8
    $ErrorActionPreference = $nativePreference
    $html = Get-Content -Raw $output
    foreach ($id in $case.Checks) { if ($html -notmatch ('id="' + [regex]::Escape($id) + '"')) { throw "Lipsește #$id în cazul $($case.Name)." } }
    Write-Host ("PASS {0} {1}" -f $case.Name, $case.Size) -ForegroundColor Green
  }
} finally {
  Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
