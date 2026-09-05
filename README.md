# Route Optimizer România

Optimizer local de rute pentru curieri, construit în HTML, CSS și JavaScript.

## Funcții

- geocodare OpenStreetMap/Nominatim pentru România;
- optimizare cu OSRM și timp estimat de condus;
- pornire, finish și întoarcere la plecare;
- editare și renumerotare manuală a stopurilor;
- flux de livrare cu statusuri și istoric local;
- navigare către următorul stop prin Google Maps sau Waze;
- import CSV, export CSV și backup JSON;
- sugestii și cache local pentru adrese;
- interfață responsive pentru telefon și desktop.

## Rulare locală

Deschide folderul într-un server static local, de exemplu Live Server în VS Code. Deschiderea directă prin `file://` poate limita unele funcții de browser.

## GitHub Pages

Proiectul este static și poate fi publicat direct din branch-ul `main`, folderul root. Nu folosește bază de date sau chei API.

Serviciile publice OpenStreetMap Nominatim și OSRM au limite de utilizare; pentru trafic intens sau utilizare comercială ar trebui configurate servicii dedicate.
