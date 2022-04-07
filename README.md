[![Node.js CI](https://github.com/neferin12/mein_campus_noten_reader/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/neferin12/mein_campus_noten_reader/actions/workflows/node.js.yml)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

# Mein Campus Noten Reader
Liest kontinuierlich die Noten von [Mein Campus](https://www.campus.uni-erlangen.de/) und sendet eine E-Mail, wenn neue Noten dazukommen

## Nutzung mit Docker
```bash
docker pull ghcr.io/neferin12/mein_campus_noten_reader:latest
```
Beim Ausführen müssen die in .env.template Umgebungsvariablen (ausgenommen BROWSER) definiert werden.

## Installation
### Installieren der Abhängigkeiten
```
npm install
```
### Konfiguration
Kopieren der Datei .env.template nach .env   
Anschließend die Felder in der .env Datei ausfüllen.

### Build
```
npm run build
```
### Testen
Zum Testen der Maileinstellungen ``node dist/mailtest.js`` ausführen. 

### Ausführen
Zum Ausführen des Readers ``node dist/index.js `` ausführen.  
Für längerfristige Ausführung empfehle ich [pm2](https://pm2.io/).
