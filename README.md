# Route Optimizer România

Aplicație locală pentru planificarea și parcurgerea rutelor de curierat în România.

## Pornire locală

Deschide folderul în VS Code și pornește un server static local, de exemplu extensia **Live Server**. Deschiderea directă cu `file://` poate bloca modulele JavaScript și unele funcții ale browserului.

Pagina principală este `index.html`. După optimizare, `routes.html` este pagina de parcurs a curierului, `saved.html` gestionează rutele denumite, `completed.html` conține istoricul local, iar `settings.html` centralizează preferințele, backup-ul, diagnosticul și ajutorul.

## Funcții principale

- geocodare Nominatim și alegerea rezultatului exact;
- optimizare OSRM cu priorități, ferestre orare, profil de vehicul, trafic estimat și drumuri de evitat;
- ETA, pauze, statusuri de livrare, notițe și navigare Google Maps, Apple Maps și Waze;
- editare prin drag-and-drop, mutare, swap, undo/redo și stopuri blocate;
- backup JSON, export CSV, rute numite și checkpoint zilnic în IndexedDB;
- OCR, coduri de bare/QR și dictare vocală;
- PWA cu cache local pentru shell, hartă și OCR după prima utilizare online.

## Verificare

În PowerShell, din folderul proiectului, rulează:

```powershell
./smoke-check.ps1
```

Nominatim, OSRM și hărțile OpenStreetMap sunt servicii publice. Pentru utilizare intensă sau comercială trebuie respectate limitele și politicile lor.

- distribuire nativă a rutei pe telefon prin Web Share, cu fallback la clipboard;
- istoricul statusurilor se migrează automat în IndexedDB, iar ruta activă se poate restaura după redeschidere;
- cache-ul offline pentru hărți și resurse runtime este limitat pentru a proteja spațiul telefonului.

Pentru verificarea automată în Chrome headless, pe desktop și mobil:

```powershell
./browser-smoke.ps1
./browser-smoke.ps1 -BaseUrl https://lttlmario.github.io/route-optimizer-romania/
```

Resursele OCR românești sunt incluse în folderul `ocr/` și sunt adăugate în cache-ul PWA.

