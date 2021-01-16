# Mein Campus Noten Reader
Liest kontinuierlich die Noten von [Mein Campus](https://www.campus.uni-erlangen.de/) und sendet eine E-Mail, wenn neue Noten dazukommen

## Installation
### Installieren der Abhängigkeiten
````
npm run install
````
### Konfiguration
Kopieren der Datei .env.template nach .env   
Anschließend die Felder in der .env Datei ausfüllen.

### Testen
Zum Testen der Maileinstellungen ``node mailtest.js`` ausführen. 

### Ausführen
Zum Ausführen des Readers ``node index.js `` ausführen.  
Für längerfristige Ausführung empfehle ich [pm2](https://pm2.io/).
