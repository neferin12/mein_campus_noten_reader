[![Node.js CI](https://github.com/neferin12/mein_campus_noten_reader/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/neferin12/mein_campus_noten_reader/actions/workflows/node.js.yml)
# Mein Campus Noten Reader
Liest kontinuierlich die Noten von [Mein Campus](https://www.campus.uni-erlangen.de/) und sendet eine E-Mail, wenn neue Noten dazukommen

## Installation
### Installieren der Abhängigkeiten
```
npm install
```
### Konfiguration
Kopieren der Datei .env.template nach .env   
Anschließend die Felder in der .env Datei ausfüllen.

### Builden
```
npm run build
```
### Testen
Zum Testen der Maileinstellungen ``node dist/mailtest.js`` ausführen. 

### Ausführen
Zum Ausführen des Readers ``node dist/index.js `` ausführen.  
Für längerfristige Ausführung empfehle ich [pm2](https://pm2.io/).
