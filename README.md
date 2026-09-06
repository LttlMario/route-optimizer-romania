# Route Optimizer România

Aplicație locală pentru planificarea și parcurgerea rutelor de curierat în România.

## Pornire locală

Deschide folderul în VS Code și pornește un server static local, de exemplu extensia **Live Server**. Deschiderea directă cu `file://` poate bloca modulele JavaScript și unele funcții ale browserului.

Pagina principală este `index.html`. După optimizare, `routes.html` este pagina de parcurs a curierului, iar `completed.html` conține istoricul local.

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
